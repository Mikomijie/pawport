import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

// Public endpoint — no auth required (this is what the finder uses)
export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const { latitude, longitude, message } = await req.json();

    if (typeof latitude !== "number" || typeof longitude !== "number") {
      return NextResponse.json({ error: "Valid coordinates are required" }, { status: 400 });
    }

    // Validate coordinate ranges
    if (latitude < -90 || latitude > 90 || longitude < -180 || longitude > 180) {
      return NextResponse.json({ error: "Coordinates out of range" }, { status: 400 });
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
        message: message ? String(message).slice(0, 500) : null,
      },
    });

    return NextResponse.json(sighting, { status: 201 });
  } catch (error) {
    console.error("Sighting error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
