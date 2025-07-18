import { Queue } from "bullmq";
import { redisClient } from "../config/redis.js";

const queueName = "job-import";
export let jobQueue;

export function initQueue() {
  jobQueue = new Queue(queueName, {
    connection: redisClient.duplicate()
  });
  console.log("BullMQ queue initialized");
}
