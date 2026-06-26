import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function GET(req: NextRequest) {
  const pin = req.nextUrl.searchParams.get("pin");

  if (!pin || !/^\d{6}$/.test(pin)) {
    return NextResponse.json({ error: "Invalid PIN. Must be 6 digits." }, { status: 400 });
  }

  const cat = await db.cat.findUnique({
    where: { pin },
    select: { id: true },
  });

  if (!cat) {
    return NextResponse.json({ error: "No cat found with this PIN" }, { status: 404 });
  }

  return NextResponse.json({ id: cat.id });
}
