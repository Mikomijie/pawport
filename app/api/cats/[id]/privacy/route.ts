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

  const cat = await db.cat.findUnique({ where: { id } });
  if (!cat || cat.ownerId !== session.userId) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  let settings = await db.privacySettings.findUnique({ where: { catId: id } });

  // Create default settings if they don't exist
  if (!settings) {
    settings = await db.privacySettings.create({ data: { catId: id } });
  }

  return NextResponse.json(settings);
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;

  const cat = await db.cat.findUnique({ where: { id } });
  if (!cat || cat.ownerId !== session.userId) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const body = await req.json();
  const allowedFields = ["showPhone", "showAddress", "showFeedingSchedule", "showLocation", "showGPSHistory"];

  // Filter to only allowed boolean fields
  const updateData: Record<string, boolean> = {};
  for (const field of allowedFields) {
    if (typeof body[field] === "boolean") {
      updateData[field] = body[field];
    }
  }

  const settings = await db.privacySettings.upsert({
    where: { catId: id },
    update: updateData,
    create: { catId: id, ...updateData },
  });

  return NextResponse.json(settings);
}
