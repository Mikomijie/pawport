import { Client, Connection } from "@temporalio/client";

let client: Client | null = null;

export async function getTemporalClient(): Promise<Client> {
  if (client) return client;

  const connection = await Connection.connect({
    address: process.env.TEMPORAL_ADDRESS || "localhost:7233",
  });

  client = new Client({ connection });
  return client;
}

export const TASK_QUEUE = "pawport-lost-cat";

/**
 * Generate a deterministic workflow ID for a cat's lost workflow.
 * This allows us to find and cancel it later.
 */
export function getLostCatWorkflowId(catId: string): string {
  return `lost-cat-${catId}`;
}
