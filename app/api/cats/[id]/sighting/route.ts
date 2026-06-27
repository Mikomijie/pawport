import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { validateCoordinates } from "@/lib/validations";

// Public endpoint — no auth required (this is what the finder uses)
export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const { latitude, longitude, message } = await req.json();

    // Validate coordinates thoroughly
    const coordCheck = validateCoordinates(latitude, longitude);
    if (!coordCheck.valid) {
      return NextResponse.json({ error: coordCheck.error }, { status: 400 });
    }

    // Verify cat exists
    const cat = await db.cat.findUnique({ where: { id } });
    if (!cat) {
      return NextResponse.json({ error: "Cat not found" }, { status: 404 });
    }

    const sighting = await db.sighting.create({
      data: {
        catId: id,
        latitude,
        longitude,
        message: message ? String(message).slice(0, 500).trim().replace(/[<>]/g, "") : null,
      },
    });

    // Only return necessary fields, not internal IDs
    return NextResponse.json({
      id: sighting.id,
      latitude: sighting.latitude,
      longitude: sighting.longitude,
      createdAt: sighting.createdAt,
    }, { status: 201 });
  } catch (error) {
    console.error("Sighting error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
