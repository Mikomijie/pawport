import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { hashPassword, createSession } from "@/lib/auth";
import { validateEmail, validatePassword, sanitizeInput } from "@/lib/validations";
import { checkRateLimit, getClientIp } from "@/lib/rate-limit";

export async function POST(req: NextRequest) {
  // Rate limiting: 5 attempts per IP per 15 minutes
  const ip = getClientIp(req);
  const { allowed, remaining, resetInSeconds } = checkRateLimit(`register:${ip}`);

  if (!allowed) {
    return NextResponse.json(
      { error: `Too many registration attempts. Try again in ${Math.ceil(resetInSeconds / 60)} minutes.` },
      {
        status: 429,
        headers: {
          "Retry-After": String(resetInSeconds),
          "X-RateLimit-Remaining": "0",
        },
      }
    );
  }

  try {
    const body = await req.json();
    const { name, email, password, phone } = body;

    if (!name || !email || !password) {
      return NextResponse.json(
        { error: "Name, email, and password are required" },
        { status: 400, headers: { "X-RateLimit-Remaining": String(remaining) } }
      );
    }

    const cleanName = sanitizeInput(name);
    const cleanEmail = email.trim().toLowerCase();

    if (!validateEmail(cleanEmail)) {
      return NextResponse.json({ error: "Invalid email format" }, { status: 400 });
    }

    const passwordError = validatePassword(password);
    if (passwordError) {
      return NextResponse.json({ error: passwordError }, { status: 400 });
    }

    const existing = await db.user.findUnique({ where: { email: cleanEmail } });
    if (existing) {
      return NextResponse.json({ error: "An account with this email already exists" }, { status: 409 });
    }

    const hashedPassword = await hashPassword(password);
    const user = await db.user.create({
      data: {
        name: cleanName,
        email: cleanEmail,
        hashedPassword,
        phone: phone ? sanitizeInput(phone) : null,
      },
    });

    await createSession(user.id);

    return NextResponse.json({ success: true }, { status: 201 });
  } catch (error) {
    console.error("Registration error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
