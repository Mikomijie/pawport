import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getSession } from "@/lib/auth";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;

  const cat = await db.cat.findUnique({
    where: { id },
    include: {
      careLogs: { orderBy: { createdAt: "desc" }, take: 20 },
      vaccinations: { orderBy: { date: "desc" }, take: 10 },
    },
  });

  if (!cat || cat.ownerId !== session.userId) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const { message } = await req.json();
  if (!message || typeof message !== "string" || message.length > 500) {
    return NextResponse.json({ error: "Message is required (max 500 chars)" }, { status: 400 });
  }

  const apiKey = process.env.OPENROUTER_API_KEY;
  if (!apiKey) {
    return NextResponse.json({ error: "AI service not configured" }, { status: 503 });
  }

  const careLogSummary = cat.careLogs.map((log) => `${log.type} at ${log.createdAt.toISOString()}${log.notes ? ` (${log.notes})` : ""}`).join("\n");

  const systemPrompt = `You are PawPort AI, a friendly and knowledgeable veterinary health assistant. You are helping the owner of a cat named "${cat.name}".

Cat Profile:
- Name: ${cat.name}
- Breed: ${cat.breed || "Unknown"}
- Age: ${cat.age ? `${cat.age} years` : "Unknown"}
- Gender: ${cat.gender || "Unknown"}
- Weight: ${cat.weight ? `${cat.weight} kg` : "Unknown"}
- Allergies: ${cat.allergies || "None recorded"}
- Dietary Restrictions: ${cat.dietaryRestrictions || "None"}
- Medical History: ${cat.medicalHistory || "None recorded"}

Recent Care Logs:
${careLogSummary || "No care logs yet."}

Vaccinations:
${cat.vaccinations.length > 0 ? cat.vaccinations.map(v => `- ${v.name} (${v.date.toLocaleDateString()})`).join("\n") : "None recorded."}

Rules:
- Be warm, concise, and helpful
- Use the cat's data to personalize your response
- Always clarify you are NOT a veterinarian and cannot diagnose
- If something sounds serious, recommend visiting a vet
- Keep responses under 200 words
- Use simple language, no medical jargon
- NEVER use markdown formatting like ** or * or # or _ — use plain text only
- NEVER use bullet points with numbers — use flowing sentences instead`;

  async function callAI(attempt: number): Promise<string | null> {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 30000);

    try {
      const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${apiKey}`,
          "HTTP-Referer": process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000",
          "X-Title": "PawPort AI Chat",
        },
        body: JSON.stringify({
          model: "openrouter/auto",
          messages: [
            { role: "system", content: systemPrompt },
            { role: "user", content: message },
          ],
          max_tokens: 400,
          temperature: 0.5,
        }),
        signal: controller.signal,
      });

      clearTimeout(timeout);

      if (!response.ok) {
        const errText = await response.text();
        console.error(`[AI Chat] Attempt ${attempt} failed:`, errText);
        return null;
      }

      const data = await response.json();
      return data.choices?.[0]?.message?.content || null;
    } catch (err) {
      clearTimeout(timeout);
      const errMsg = err instanceof Error ? err.message : String(err);
      console.error(`[AI Chat] Attempt ${attempt} error:`, errMsg);
      return null;
    }
  }

  // Retry up to 2 times
  let reply = await callAI(1);
  if (!reply) {
    reply = await callAI(2);
  }

  if (!reply) {
    return NextResponse.json({ reply: "I'm temporarily unavailable. Please try again in a moment. If this persists, the AI service may be experiencing issues." });
  }

  return NextResponse.json({ reply });
}
