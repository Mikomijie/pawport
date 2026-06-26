import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getSession } from "@/lib/auth";

export async function POST(
  _req: NextRequest,
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
      careLogs: { orderBy: { createdAt: "desc" }, take: 10 },
      vaccinations: { orderBy: { date: "desc" }, take: 5 },
    },
  });

  if (!cat || cat.ownerId !== session.userId) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const apiKey = process.env.OPENROUTER_API_KEY;
  if (!apiKey) {
    return NextResponse.json({ error: "AI service not configured" }, { status: 503 });
  }

  // Build context for the AI
  const careLogSummary = cat.careLogs.map((log) => ({
    type: log.type,
    notes: log.notes,
    completedAt: log.completedAt?.toISOString(),
    createdAt: log.createdAt.toISOString(),
  }));

  const prompt = `You are a veterinary AI health assistant for cats. Analyze the following cat's data and provide a health assessment.

Cat Profile:
- Name: ${cat.name}
- Breed: ${cat.breed || "Unknown"}
- Age: ${cat.age ? `${cat.age} years` : "Unknown"}
- Gender: ${cat.gender || "Unknown"}
- Weight: ${cat.weight ? `${cat.weight} kg` : "Unknown"}
- Allergies: ${cat.allergies || "None recorded"}
- Dietary Restrictions: ${cat.dietaryRestrictions || "None"}
- Medical History: ${cat.medicalHistory || "None recorded"}

Recent Care Logs (last 10):
${careLogSummary.length > 0 ? JSON.stringify(careLogSummary, null, 2) : "No care logs recorded yet."}

Vaccination Records:
${cat.vaccinations.length > 0 ? cat.vaccinations.map(v => `- ${v.name} (${v.date.toLocaleDateString()})`).join("\n") : "No vaccinations recorded."}

Please respond in this exact JSON format:
{
  "healthScore": <number 1-10>,
  "observations": ["<observation 1>", "<observation 2>"],
  "warnings": ["<warning if any>"],
  "recommendations": ["<recommendation 1>", "<recommendation 2>"],
  "hydrationStatus": "<good/monitor/concern>",
  "weightStatus": "<underweight/healthy/overweight/unknown>"
}

Base your assessment on the available data. If data is missing, note that in observations and recommend the owner track it. Be helpful but conservative with warnings.`;

  try {
    const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${apiKey}`,
        "HTTP-Referer": process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000",
        "X-Title": "PawPort Cat Health Assistant",
      },
      body: JSON.stringify({
        model: "openrouter/auto",
        messages: [
          { role: "system", content: "You are a veterinary AI assistant. Respond with a JSON object containing: healthScore (1-10), observations (array of strings), warnings (array of strings), recommendations (array of strings), hydrationStatus (good/monitor/concern), weightStatus (underweight/healthy/overweight/unknown). Do not wrap in markdown code blocks. Never provide actual medical diagnoses — only recommendations." },
          { role: "user", content: prompt },
        ],
        max_tokens: 1000,
        temperature: 0.3,
      }),
    });

    if (!response.ok) {
      const errText = await response.text();
      console.error("[AI Health] OpenRouter error:", errText);
      return NextResponse.json({ error: "AI service unavailable" }, { status: 502 });
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content;

    if (!content) {
      return NextResponse.json({ error: "No response from AI" }, { status: 502 });
    }

    // Parse the JSON response from the AI
    let healthData;
    try {
      // Try to extract JSON from potential markdown code blocks
      const codeBlockMatch = content.match(/```(?:json)?\s*([\s\S]*?)```/);
      const jsonStr = codeBlockMatch ? codeBlockMatch[1].trim() : content;
      const jsonMatch = jsonStr.match(/\{[\s\S]*\}/);
      healthData = JSON.parse(jsonMatch ? jsonMatch[0] : jsonStr);
    } catch {
      // If JSON parsing fails, present the AI's raw text as the analysis
      const lines = content.split("\n").filter((l: string) => l.trim());
      healthData = {
        healthScore: 7,
        observations: lines.length > 0 ? lines : ["AI provided a text-based analysis."],
        warnings: [],
        recommendations: [],
        hydrationStatus: "unknown",
        weightStatus: "unknown",
      };
    }

    return NextResponse.json({
      ...healthData,
      disclaimer: "⚠️ This is an AI-generated health assessment and NOT a medical diagnosis. Always consult a licensed veterinarian for medical decisions.",
      generatedAt: new Date().toISOString(),
    });
  } catch (error) {
    console.error("[AI Health] Error:", error);
    return NextResponse.json({ error: "Failed to generate health assessment" }, { status: 500 });
  }
}
