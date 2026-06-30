import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getSession } from "@/lib/auth";
import { getTemporalClient, getLostCatWorkflowId, TASK_QUEUE } from "@/lib/temporal";

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
  const cat = await db.cat.findUnique({
    where: { id },
    include: { owner: { select: { name: true, email: true } } },
  });
  if (!cat || cat.ownerId !== session.userId) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const body = await req.json();
  const { isLost } = body;

  // Allowlist: only these fields can be updated via PATCH
  const allowedFields = ["name", "breed", "color", "age", "gender", "weight", "microchipId", "allergies", "dietaryRestrictions", "medicalHistory", "emergencyContactName", "emergencyContactPhone"];
  const updateData: Record<string, unknown> = {};

  for (const field of allowedFields) {
    if (body[field] !== undefined) {
      if (typeof body[field] === "string") {
        updateData[field] = body[field].trim().replace(/[<>]/g, "").slice(0, 500);
      } else {
        updateData[field] = body[field];
      }
    }
  }

  if (typeof isLost === "boolean") {
    updateData.isLost = isLost;
    updateData.lostAt = isLost ? new Date() : null;
  }

  const updated = await db.cat.update({
    where: { id },
    data: updateData,
  });

  // Handle Temporal workflow for lost/found status changes
  if (typeof isLost === "boolean") {
    console.log(`[Temporal] Lost status changed to ${isLost} for cat "${cat.name}" (${id})`);
    console.log(`[Temporal] Attempting to connect to Temporal at ${process.env.TEMPORAL_ADDRESS || "localhost:7233"}...`);

    try {
      const temporalClient = await getTemporalClient();
      const workflowId = getLostCatWorkflowId(id);
      console.log(`[Temporal] Connected. Workflow ID: ${workflowId}`);

      if (isLost) {
        // Start escalation workflow
        console.log(`[Temporal] Starting lostCatEscalationWorkflow...`);
        await temporalClient.workflow.start("lostCatEscalationWorkflow", {
          taskQueue: TASK_QUEUE,
          workflowId,
          args: [{
            catId: id,
            catName: cat.name,
            ownerName: cat.owner.name,
            ownerEmail: cat.owner.email,
          }],
        });
        console.log(`[Temporal] SUCCESS: Workflow started for cat "${cat.name}" (${workflowId})`);
      } else {
        // Cancel escalation workflow (cat was found)
        console.log(`[Temporal] Cancelling workflow for cat "${cat.name}"...`);
        try {
          const handle = temporalClient.workflow.getHandle(workflowId);
          await handle.cancel();
          console.log(`[Temporal] SUCCESS: Workflow cancelled for cat "${cat.name}" (${workflowId})`);
        } catch (cancelErr: unknown) {
          const message = cancelErr instanceof Error ? cancelErr.message : String(cancelErr);
          console.log(`[Temporal] Could not cancel workflow ${workflowId}: ${message}`);
        }
      }
    } catch (temporalErr: unknown) {
      const message = temporalErr instanceof Error ? temporalErr.message : String(temporalErr);
      console.error(`[Temporal] FAILED: ${message}`);
      console.error("[Temporal] Is Temporal server running? Start with: temporal server start-dev");
    }
  }

  return NextResponse.json(updated);
}
