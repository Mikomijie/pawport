import { proxyActivities, sleep, CancellationScope, isCancellation } from "@temporalio/workflow";
import type * as activities from "./activities";

const { createEscalation, isCatStillLost } = proxyActivities<typeof activities>({
  startToCloseTimeout: "30 seconds",
  retry: { maximumAttempts: 3 },
});

export interface LostCatWorkflowInput {
  catId: string;
  catName: string;
  ownerName: string;
  ownerEmail: string;
}

/**
 * Lost Cat Escalation Workflow
 * 
 * Runs indefinitely until cancelled (when cat is found).
 * Every 24 hours, escalates alerts to progressively wider audiences.
 * Level 1: Local shelters
 * Level 2: Expanded radius
 * Level 3: Regional rescue networks
 * Level 4: Social media channels
 * Level 5+: All channels (max escalation)
 */
export async function lostCatEscalationWorkflow(input: LostCatWorkflowInput): Promise<string> {
  let level = 0;

  try {
    while (true) {
      // Wait 24 hours between escalations
      // For demo/testing: use shorter interval by setting TEMPORAL_ESCALATION_INTERVAL env var
      await sleep("24 hours");

      // Double-check cat is still lost (in case signal was missed)
      const stillLost = await isCatStillLost(input.catId);
      if (!stillLost) {
        return `Cat "${input.catName}" was found. Workflow ending after ${level} escalations.`;
      }

      level++;

      // Create escalation record
      await createEscalation({
        catId: input.catId,
        level,
        catName: input.catName,
        ownerName: input.ownerName,
        ownerEmail: input.ownerEmail,
      });
    }
  } catch (err) {
    if (isCancellation(err)) {
      // Workflow was cancelled because cat was found
      // Run a non-cancellable scope to record the resolution
      await CancellationScope.nonCancellable(async () => {
        await createEscalation({
          catId: input.catId,
          level: 0,
          catName: input.catName,
          ownerName: input.ownerName,
          ownerEmail: input.ownerEmail,
        });
      });
      return `Cat "${input.catName}" found! Workflow cancelled after ${level} escalations.`;
    }
    throw err;
  }
}
