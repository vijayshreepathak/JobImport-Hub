import express from "express";
import axios from "axios";
import xml2js from "xml2js";
import Job from "../models/Job.js";
import ImportLog from "../models/ImportLog.js";
import { jobQueue } from "../services/queue.js";
import { registerSSEClient } from "../workers/importWorker.js";

const router = express.Router();

// Manual import trigger
router.post("/import", async (req, res) => {
  console.log("POST /api/import called");
  if (!jobQueue) {
    console.error("jobQueue is not initialized!");
    return res.status(500).json({ error: "Job queue not initialized" });
  }
  const feeds = (process.env.IMPORT_FEEDS || "").split(",").map(f => f.trim()).filter(Boolean);
  if (!feeds.length) {
    console.error("No feeds found in IMPORT_FEEDS");
    return res.status(400).json({ error: "No feeds configured in IMPORT_FEEDS" });
  }
  for (const url of feeds) {
    console.log(`Enqueuing import job for feed: ${url}`);
    await jobQueue.add("import", { url, fileName: url }, { removeOnComplete: true });
  }
  res.json({ status: "enqueued", feeds });
});

// Import history with pagination and date filter
router.get("/history", async (req, res) => {
  const { page = 1, limit = 20, start, end } = req.query;
  const filter = {};
  if (start || end) {
    filter.startedAt = {};
    if (start) filter.startedAt.$gte = new Date(start);
    if (end) filter.startedAt.$lte = new Date(end);
  }
  const logs = await ImportLog.find(filter)
    .sort({ startedAt: -1 })
    .skip((page - 1) * limit)
    .limit(Number(limit));
  const total = await ImportLog.countDocuments(filter);
  res.json({ logs, total });
});

// SSE for live progress
router.get("/progress", (req, res) => {
  res.set({
    "Content-Type": "text/event-stream",
    "Cache-Control": "no-cache",
    Connection: "keep-alive"
  });
  res.flushHeaders();
  res.write("retry: 10000\n\n");
  registerSSEClient(res);
});

/**
 * GET /api/jobs
 * Fetches jobs from real XML feeds, converts to JSON, and returns a combined job list.
 * Query params: none
 * Response: { jobs: [ ... ] }
 */
router.get("/jobs", async (req, res) => {
  const feeds = [
    "https://jobicy.com/?feed=job_feed",
    "https://jobicy.com/?feed=job_feed&job_categories=smm&job_types=full-time",
    "https://jobicy.com/?feed=job_feed&job_categories=seller&job_types=full-time&search_region=france",
    "https://jobicy.com/?feed=job_feed&job_categories=design-multimedia",
    "https://jobicy.com/?feed=job_feed&job_categories=data-science",
    "https://jobicy.com/?feed=job_feed&job_categories=copywriting",
    "https://jobicy.com/?feed=job_feed&job_categories=business",
    "https://jobicy.com/?feed=job_feed&job_categories=management",
    "https://www.higheredjobs.com/rss/articleFeed.cfm"
  ];
  try {
    let allJobs = [];
    for (const url of feeds) {
      const { data } = await axios.get(url, { timeout: 20000 });
      const json = await xml2js.parseStringPromise(data, { explicitArray: false });
      const items = json.rss?.channel?.item || json.rss?.item || json.channel?.item || [];
      const jobs = Array.isArray(items) ? items : [items];
      allJobs = allJobs.concat(jobs.map(j => ({ ...j, source: url })));
    }
    res.json({ jobs: allJobs });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
