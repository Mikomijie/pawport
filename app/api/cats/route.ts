import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getSession } from "@/lib/auth";
import { sanitizeInput } from "@/lib/validations";

export async function GET() {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const cats = await db.cat.findMany({
    where: { ownerId: session.userId },
    include: { vaccinations: true, sightings: { orderBy: { createdAt: "desc" }, take: 5 } },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json(cats);
}

export async function POST(req: NextRequest) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await req.json();
    const { name, breed, color, age, microchipId } = body;

    if (!name) {
      return NextResponse.json({ error: "Cat name is required" }, { status: 400 });
    }

    const cat = await db.cat.create({
      data: {
        name: sanitizeInput(name),
        breed: breed ? sanitizeInput(breed) : null,
        color: color ? sanitizeInput(color) : null,
        age: age ? parseInt(age, 10) : null,
        microchipId: microchipId ? sanitizeInput(microchipId) : null,
        ownerId: session.userId,
      },
    });

    return NextResponse.json(cat, { status: 201 });
  } catch (error) {
    console.error("Create cat error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
