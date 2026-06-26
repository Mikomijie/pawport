import { db } from "./db";

/**
 * Generate a unique 6-digit PIN for a cat.
 * Retries up to 10 times if a collision is found.
 */
export async function generateUniquePin(): Promise<string> {
  for (let attempt = 0; attempt < 10; attempt++) {
    const pin = String(Math.floor(100000 + Math.random() * 900000));
    const existing = await db.cat.findUnique({ where: { pin } });
    if (!existing) return pin;
  }
  throw new Error("Failed to generate unique PIN after 10 attempts");
}
