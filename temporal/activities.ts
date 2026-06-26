import { PrismaClient } from "@prisma/client";

const db = new PrismaClient();

export interface EscalationInput {
  catId: string;
  level: number;
  catName: string;
  ownerName: string;
  ownerEmail: string;
}

/**
 * Activity: Create an escalation record in the database.
 * In production, this would also send emails/notifications to nearby shelters.
 */
export async function createEscalation(input: EscalationInput): Promise<void> {
  const messages: Record<number, string> = {
    0: `✅ ${input.catName} has been found! Alert escalation workflow cancelled.`,
    1: `Alert Level 1: ${input.catName} has been missing for 24 hours. Notifying local shelters.`,
    2: `Alert Level 2: ${input.catName} has been missing for 48 hours. Expanding search radius.`,
    3: `Alert Level 3: ${input.catName} has been missing for 72 hours. Contacting regional rescue networks.`,
    4: `Alert Level 4: ${input.catName} has been missing for 96 hours. Posting to social media channels.`,
    5: `Alert Level 5: ${input.catName} has been missing for 120 hours. Escalating to all available channels.`,
  };

  const message = messages[input.level] || 
    `Alert Level ${input.level}: ${input.catName} has been missing for ${input.level * 24} hours. Maximum escalation active.`;

  await db.escalation.create({
    data: {
      catId: input.catId,
      level: input.level,
      message,
    },
  });

  // In production: send email to owner, notify shelters, post to social media
  console.log(`[Temporal] Escalation Level ${input.level} for cat "${input.catName}" (owner: ${input.ownerEmail})`);
}

/**
 * Activity: Check if the cat is still marked as lost.
 * This allows the workflow to self-terminate if status changed outside the workflow.
 */
export async function isCatStillLost(catId: string): Promise<boolean> {
  const cat = await db.cat.findUnique({
    where: { id: catId },
    select: { isLost: true },
  });
  return cat?.isLost ?? false;
}
