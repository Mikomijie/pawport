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

  const logs = await db.careLog.findMany({
    where: { catId: id },
    orderBy: { createdAt: "desc" },
    take: 20,
  });

  return NextResponse.json(logs);
}

export async function POST(
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

  const { type, notes, scheduledAt } = await req.json();

  const validTypes = ["FEEDING", "WATER", "MEDICATION", "VET_APPOINTMENT", "BEHAVIOUR_NOTE"];
  if (!type || typeof type !== "string" || !validTypes.includes(type)) {
    return NextResponse.json({ error: "Invalid log type" }, { status: 400 });
  }

  const sanitizedNotes = notes ? String(notes).trim().replace(/[<>]/g, "").slice(0, 500) : null;

  const log = await db.careLog.create({
    data: {
      catId: id,
      type,
      notes: sanitizedNotes,
      scheduledAt: scheduledAt ? new Date(scheduledAt) : null,
      completedAt: new Date(),
    },
  });

  return NextResponse.json(log, { status: 201 });
}
