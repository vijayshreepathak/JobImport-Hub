import { Worker, QueueEvents } from "bullmq";
import { redisClient } from "../config/redis.js";
import mongoose from "mongoose";
import Job from "../models/Job.js";
import ImportLog from "../models/ImportLog.js";
import { fetchAndParseXML, normalizeJobs } from "../services/jobFetcher.js";

const queueName = "job-import";
const concurrency = parseInt(process.env.WORKER_CONCURRENCY, 10) || 5;

let sseClients = [];

export function registerSSEClient(res) {
  sseClients.push(res);
  res.on("close", () => {
    sseClients = sseClients.filter((c) => c !== res);
  });
}

function sendSSE(data) {
  sseClients.forEach((res) => {
    res.write(`data: ${JSON.stringify(data)}\n\n`);
  });
}

export function startWorker() {
  const worker = new Worker(
    queueName,
    async (job) => {
      const { url, fileName } = job.data;
      const session = await mongoose.startSession();
      let log;
      let attempts = 0;
      let maxAttempts = 5;
      let backoff = 1000;
      while (attempts < maxAttempts) {
        try {
          session.startTransaction();
          log = await ImportLog.create([{ startedAt: new Date(), fileName }], { session });
          const feedJson = await fetchAndParseXML(url);
          const jobs = normalizeJobs(feedJson, url);
          let newCount = 0,
            updatedCount = 0,
            failedCount = 0;
          for (const jobData of jobs) {
            try {
              const res = await Job.findOneAndUpdate(
                { external_id: jobData.external_id, source: jobData.source },
                { $set: jobData },
                { upsert: true, new: true, session }
              );
              if (res.createdAt.getTime() === res.updatedAt.getTime()) newCount++;
              else updatedCount++;
            } catch (e) {
              failedCount++;
            }
          }
          log[0].total = jobs.length;
          log[0].newCount = newCount;
          log[0].updatedCount = updatedCount;
          log[0].failedCount = failedCount;
          log[0].endedAt = new Date();
          await log[0].save({ session });
          await session.commitTransaction();
          sendSSE({ status: "completed", fileName, ...log[0]._doc });
          break;
        } catch (err) {
          await session.abortTransaction();
          if (log) {
            log[0].endedAt = new Date();
            log[0].failedCount = (log[0].failedCount || 0) + 1;
            await log[0].save({ session });
          }
          attempts++;
          if (attempts < maxAttempts) {
            await new Promise((r) => setTimeout(r, backoff));
            backoff *= 2;
          } else {
            sendSSE({ status: "failed", fileName, error: err.message });
          }
        } finally {
          session.endSession();
        }
      }
    },
    {
      concurrency,
      connection: redisClient.duplicate(),
      lockDuration: 60000
    }
  );

  worker.on("failed", (job, err) => {
    sendSSE({ status: "failed", fileName: job.data.fileName, error: err.message });
  });

  const queueEvents = new QueueEvents(queueName, { connection: redisClient.duplicate() });
  queueEvents.on("completed", ({ jobId }) => {
    sendSSE({ status: "completed", jobId });
  });
}
