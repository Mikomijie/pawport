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

  // Handle Temporal workflow for lost/found status changes
  if (typeof isLost === "boolean") {
    try {
      const temporalClient = await getTemporalClient();
      const workflowId = getLostCatWorkflowId(id);

      if (isLost) {
        // Start escalation workflow
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
        console.log(`[Temporal] Started escalation workflow for cat "${cat.name}" (${workflowId})`);
      } else {
        // Cancel escalation workflow (cat was found)
        try {
          const handle = temporalClient.workflow.getHandle(workflowId);
          await handle.cancel();
          console.log(`[Temporal] Cancelled escalation workflow for cat "${cat.name}" (${workflowId})`);
        } catch (cancelErr: unknown) {
          // Workflow may not exist or already completed — that's fine
          const message = cancelErr instanceof Error ? cancelErr.message : String(cancelErr);
          console.log(`[Temporal] Could not cancel workflow ${workflowId}: ${message}`);
        }
      }
    } catch (temporalErr: unknown) {
      // Don't fail the API request if Temporal is unavailable
      // The lost/found status is still updated in the DB
      const message = temporalErr instanceof Error ? temporalErr.message : String(temporalErr);
      console.error(`[Temporal] Error: ${message}`);
      console.error("[Temporal] Ensure Temporal server is running: temporal server start-dev");
    }
  }

  return NextResponse.json(updated);
}
