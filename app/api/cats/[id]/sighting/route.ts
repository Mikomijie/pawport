import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { validateCoordinates } from "@/lib/validations";
import { sendSightingNotification } from "@/lib/email";

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

    // Verify cat exists and get owner info
    const cat = await db.cat.findUnique({
      where: { id },
      include: { owner: { select: { name: true, email: true } } },
    });
    if (!cat) {
      return NextResponse.json({ error: "Cat not found" }, { status: 404 });
    }

    const sanitizedMessage = message ? String(message).slice(0, 500).trim().replace(/[<>]/g, "") : null;

    const sighting = await db.sighting.create({
      data: {
        catId: id,
        latitude,
        longitude,
        message: sanitizedMessage,
      },
    });

    // Send email notification to owner if cat is marked as lost
    if (cat.isLost) {
      sendSightingNotification({
        ownerEmail: cat.owner.email,
        ownerName: cat.owner.name,
        catName: cat.name,
        latitude,
        longitude,
        finderMessage: sanitizedMessage,
      }).catch((err) => console.error("[Email] Background send failed:", err));
    }

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
