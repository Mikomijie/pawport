import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getSession } from "@/lib/auth";

export async function GET(
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
      careLogs: { orderBy: { createdAt: "desc" }, take: 30 },
      vaccinations: { orderBy: { date: "desc" }, take: 10 },
      sightings: { orderBy: { createdAt: "desc" }, take: 5 },
      escalations: { orderBy: { createdAt: "desc" }, take: 5 },
    },
  });

  if (!cat || cat.ownerId !== session.userId) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const apiKey = process.env.OPENROUTER_API_KEY;
  if (!apiKey) {
    return NextResponse.json({ error: "AI service not configured" }, { status: 503 });
  }

  const events: string[] = [];

  cat.careLogs.forEach((log) => {
    events.push(`${log.createdAt.toISOString().split("T")[0]}: ${log.type}${log.notes ? ` - ${log.notes}` : ""}`);
  });

  cat.vaccinations.forEach((v) => {
    events.push(`${v.date.toISOString().split("T")[0]}: Vaccination - ${v.name}`);
  });

  if (cat.isLost && cat.lostAt) {
    events.push(`${cat.lostAt.toISOString().split("T")[0]}: Marked as LOST`);
  }

  cat.sightings.forEach((s) => {
    events.push(`${s.createdAt.toISOString().split("T")[0]}: Sighting at ${s.latitude.toFixed(3)}, ${s.longitude.toFixed(3)}`);
  });

  const prompt = `You are PawPort AI. Generate a brief, warm health timeline narrative for this cat.

Cat: ${cat.name} (${cat.breed || "Unknown breed"}, ${cat.age ? `${cat.age} years` : "age unknown"}, ${cat.weight ? `${cat.weight}kg` : "weight unknown"})
Allergies: ${cat.allergies || "None"}
Medical History: ${cat.medicalHistory || "None"}

Recent events (newest first):
${events.slice(0, 20).join("\n") || "No events recorded yet."}

Write a 3-5 sentence narrative summary of this cat's recent health journey. Mention trends (feeding regularity, any concerns, vaccination status). Be warm and encouraging. If data is sparse, note what the owner could start tracking. End with one actionable tip. Keep it under 100 words.`;

  try {
    const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${apiKey}`,
        "HTTP-Referer": process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000",
        "X-Title": "PawPort Health Timeline",
      },
      body: JSON.stringify({
        model: "openrouter/auto",
        messages: [
          { role: "system", content: "You are a friendly veterinary AI. Write short, warm narrative summaries. No medical diagnoses. Keep responses under 100 words." },
          { role: "user", content: prompt },
        ],
        max_tokens: 200,
        temperature: 0.4,
      }),
    });

    if (!response.ok) {
      console.error("[AI Timeline] Error:", await response.text());
      return NextResponse.json({ error: "AI service unavailable" }, { status: 502 });
    }

    const data = await response.json();
    const narrative = data.choices?.[0]?.message?.content;

    return NextResponse.json({ narrative: narrative || "Unable to generate timeline." });
  } catch (error) {
    console.error("[AI Timeline] Error:", error);
    return NextResponse.json({ error: "Failed to generate timeline" }, { status: 500 });
  }
}
