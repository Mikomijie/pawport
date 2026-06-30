import { Resend } from "resend";

let resend: Resend | null = null;

function getResend(): Resend | null {
  if (!process.env.RESEND_API_KEY) return null;
  if (!resend) {
    resend = new Resend(process.env.RESEND_API_KEY);
  }
  return resend;
}

interface SightingEmailParams {
  ownerEmail: string;
  ownerName: string;
  catName: string;
  latitude: number;
  longitude: number;
  finderMessage: string | null;
}

export async function sendSightingNotification(params: SightingEmailParams): Promise<boolean> {
  const client = getResend();
  if (!client) {
    console.log("[Email] Resend not configured — skipping notification");
    return false;
  }

  const mapsUrl = `https://www.google.com/maps?q=${params.latitude},${params.longitude}`;
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000";

  try {
    await client.emails.send({
      from: "PawPort Alerts <onboarding@resend.dev>",
      to: params.ownerEmail,
      subject: `Someone found ${params.catName}!`,
      html: `
        <div style="font-family: 'Inter', system-ui, sans-serif; max-width: 500px; margin: 0 auto; padding: 32px 24px; background: #FDFBF7;">
          <div style="text-align: center; margin-bottom: 24px;">
            <h1 style="font-family: 'Georgia', serif; color: #2C1810; font-size: 24px; margin: 0;">PawPort Alert</h1>
          </div>
          
          <div style="background: white; border-radius: 16px; padding: 24px; box-shadow: 0 2px 12px rgba(44,24,16,0.08);">
            <h2 style="color: #2C1810; font-size: 20px; margin: 0 0 8px 0;">Someone spotted ${params.catName}!</h2>
            <p style="color: #6B5B52; font-size: 14px; margin: 0 0 16px 0;">
              Good news, ${params.ownerName} — a kind person just reported seeing your cat.
            </p>
            
            <div style="background: #EDF7F2; border-radius: 10px; padding: 16px; margin-bottom: 16px;">
              <p style="color: #2D6A4F; font-size: 13px; font-weight: 600; margin: 0 0 4px 0;">Location</p>
              <p style="color: #2C1810; font-size: 14px; margin: 0;">
                ${params.latitude.toFixed(5)}, ${params.longitude.toFixed(5)}
              </p>
              <a href="${mapsUrl}" style="display: inline-block; margin-top: 8px; color: #E07A5F; font-size: 13px; font-weight: 600; text-decoration: none;">
                Open in Google Maps →
              </a>
            </div>

            ${params.finderMessage ? `
              <div style="background: #F8F4F1; border-radius: 10px; padding: 16px; margin-bottom: 16px;">
                <p style="color: #6B5B52; font-size: 13px; font-weight: 600; margin: 0 0 4px 0;">Message from finder</p>
                <p style="color: #2C1810; font-size: 14px; margin: 0;">"${params.finderMessage}"</p>
              </div>
            ` : ""}

            <a href="${baseUrl}/dashboard" style="display: block; text-align: center; background: #E07A5F; color: white; padding: 14px 24px; border-radius: 10px; text-decoration: none; font-weight: 600; font-size: 14px;">
              View on Dashboard
            </a>
          </div>

          <p style="text-align: center; color: #6B5B52; font-size: 11px; margin-top: 24px;">
            PawPort — Digital Health Passport for Cats
          </p>
        </div>
      `,
    });

    console.log(`[Email] Sighting notification sent to ${params.ownerEmail} for cat "${params.catName}"`);
    return true;
  } catch (error) {
    console.error("[Email] Failed to send:", error);
    return false;
  }
}
