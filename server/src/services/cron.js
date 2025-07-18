import cron from "node-cron";
import dotenv from "dotenv";
import { jobQueue } from "./queue.js";
dotenv.config();

export function startCron() {
  const schedule = process.env.CRON_SCHEDULE || "0 * * * *";
  cron.schedule(schedule, async () => {
    const feeds = (process.env.IMPORT_FEEDS || "").split(",");
    for (const url of feeds) {
      await jobQueue.add("import", { url, fileName: url }, { removeOnComplete: true });
    }
    console.log(`[CRON] Enqueued import jobs for feeds: ${feeds.join(", ")}`);
  });
}
