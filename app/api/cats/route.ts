import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getSession } from "@/lib/auth";
import { sanitizeInput } from "@/lib/validations";
import { generateUniquePin } from "@/lib/pin";
import { writeFile, mkdir } from "fs/promises";
import path from "path";

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
    const formData = await req.formData();

    const name = formData.get("name") as string | null;
    const breed = formData.get("breed") as string | null;
    const color = formData.get("color") as string | null;
    const age = formData.get("age") as string | null;
    const microchipId = formData.get("microchipId") as string | null;
    const photo = formData.get("photo") as File | null;

    if (!name) {
      return NextResponse.json({ error: "Cat name is required" }, { status: 400 });
    }

    // Handle photo upload
    let photoUrl: string | null = null;
    if (photo && photo.size > 0) {
      // Validate file type
      const allowedTypes = ["image/jpeg", "image/png", "image/webp", "image/gif"];
      if (!allowedTypes.includes(photo.type)) {
        return NextResponse.json({ error: "Invalid image type. Use JPEG, PNG, WebP, or GIF." }, { status: 400 });
      }

      // Validate file size (max 5MB)
      if (photo.size > 5 * 1024 * 1024) {
        return NextResponse.json({ error: "Image must be under 5MB" }, { status: 400 });
      }

      // Save file
      const uploadsDir = path.join(process.cwd(), "public", "uploads");
      await mkdir(uploadsDir, { recursive: true });

      const ext = photo.name.split(".").pop() || "jpg";
      const filename = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`;
      const filepath = path.join(uploadsDir, filename);

      const buffer = Buffer.from(await photo.arrayBuffer());
      await writeFile(filepath, buffer);

      photoUrl = `/uploads/${filename}`;
    }

    // Generate unique 6-digit PIN
    const pin = await generateUniquePin();

    const cat = await db.cat.create({
      data: {
        pin,
        name: sanitizeInput(name),
        breed: breed ? sanitizeInput(breed) : null,
        color: color ? sanitizeInput(color) : null,
        age: age ? parseInt(age, 10) : null,
        microchipId: microchipId ? sanitizeInput(microchipId) : null,
        photoUrl,
        ownerId: session.userId,
      },
    });

    return NextResponse.json(cat, { status: 201 });
  } catch (error) {
    console.error("Create cat error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
