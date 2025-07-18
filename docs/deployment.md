# Architecture & Scaling

## Overview

- **Scheduler**: `node-cron` triggers import jobs hourly.
- **Queue**: BullMQ (Redis) manages job concurrency, retries, and scaling.
- **Worker**: Each worker fetches, parses, deduplicates, and upserts jobs in MongoDB, logging each run in a transaction.
- **Admin UI**: Next.js dashboard shows live status and import history.

## Scaling

- **Horizontal Scaling**: Run multiple `server` containers; BullMQ/Redis ensures only one worker processes a job.
- **Sharding**: For very large feeds, split jobs by feed or by batch (e.g., 1000 jobs per batch).
- **Worker Concurrency**: Controlled via `WORKER_CONCURRENCY` env var.
- **MongoDB**: Use sharded clusters for high write throughput.
- **Redis**: Use managed Redis (e.g., AWS Elasticache) for HA.

## Live Updates

- **SSE**: Server-Sent Events push import progress to the dashboard in real time.

## Fault Tolerance

- **Retries**: BullMQ handles retries with exponential backoff.
- **Transactions**: Import logs and job upserts are wrapped in MongoDB transactions for consistency.

## Security

- All secrets/configs via environment variables.
- No secrets in code or Docker images.

## Extending

- Add more feeds by updating `IMPORT_FEEDS`.
- Add more fields to `Job` or `ImportLog` schemas as needed.