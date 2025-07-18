import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import mongoose from "mongoose";
import { createServer } from "http";
import apiRoutes from "./routes/api.js";
import { startCron } from "./services/cron.js";
import { startWorker } from "./workers/importWorker.js";
import { initQueue } from "./services/queue.js";
import "./config/mongo.js";
import "./config/redis.js";

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());
app.use("/api", apiRoutes);

const port = process.env.PORT || 4000;
const server = createServer(app);

server.listen(port, () => {
  console.log(`Server listening on port ${port}`);
  startCron();
  initQueue();
  startWorker();
});
