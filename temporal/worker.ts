import { Worker } from "@temporalio/worker";
import * as activities from "./activities";
import path from "path";

async function run() {
  const worker = await Worker.create({
    workflowsPath: path.resolve(__dirname, "./workflows.ts"),
    activities,
    taskQueue: "pawport-lost-cat",
    // Connect to local Temporal server (default: localhost:7233)
    connection: undefined, // uses default localhost:7233
  });

  console.log("🐾 PawPort Temporal Worker started");
  console.log("   Task Queue: pawport-lost-cat");
  console.log("   Listening for lost cat workflows...\n");

  await worker.run();
}

run().catch((err) => {
  console.error("Worker failed:", err);
  process.exit(1);
});
