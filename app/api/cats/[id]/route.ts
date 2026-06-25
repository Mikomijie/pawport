import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getSession } from "@/lib/auth";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  const cat = await db.cat.findUnique({
    where: { id },
    include: {
      owner: { select: { name: true, email: true, phone: true } },
      vaccinations: { orderBy: { date: "desc" } },
    },
  });

  if (!cat) {
    return NextResponse.json({ error: "Cat not found" }, { status: 404 });
  }

  return NextResponse.json(cat);
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

  // Verify ownership
  const cat = await db.cat.findUnique({ where: { id } });
  if (!cat || cat.ownerId !== session.userId) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const body = await req.json();
  const { isLost, ...rest } = body;

  const updateData: Record<string, unknown> = { ...rest };

  if (typeof isLost === "boolean") {
    updateData.isLost = isLost;
    updateData.lostAt = isLost ? new Date() : null;
  }

  const updated = await db.cat.update({
    where: { id },
    data: updateData,
  });

  return NextResponse.json(updated);
}
