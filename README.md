# JobImport-Hub
---

## 🚀 Overview

JobImport-Hub is a robust, production-ready solution for efficient job-feed aggregation. It automatically fetches multiple XML feeds, deduplicates and upserts jobs into MongoDB, tracks import history, and exposes a real-time admin UI.  
Built with **Next.js**, **Express**, **MongoDB**, **Redis**, **BullMQ**, and orchestrated by **Docker Compose**, it provides a scalable foundation for any job board or aggregation platform.

---

## ✨ Key Features

* **Automated & on-demand imports:** Schedule hourly imports or trigger them manually for multiple XML feeds.  
* **Intelligent data processing:** Converts XML to JSON, deduplicates, and upserts the data into MongoDB.  
* **Scalable queueing:** Uses **Redis** + **BullMQ** for high-throughput job processing.  
* **Comprehensive logging:** Records totals, new, updated, and failed jobs for every run.  
* **Real-time Admin UI (Next.js):**  
  * **Live dashboard:** Progress updates via Server-Sent Events (SSE).  
  * **Import history:** Detailed statistics for all runs.  
* **Containerized deployment:** One-command local, staging, and production stacks via **Docker Compose**.  
* **Flexible configuration:** All settings are environment-variable driven.  
* **Rigorous testing:** Jest + ESM tests for XML parsing and data-normalization logic.

---

## 🏗️ System Architecture

```
graph TD
    subgraph Client [Next.js Admin UI]
        UI[Dashboard & History Table]
        SSE[Live Updates (SSE)]
    end

    subgraph Server
        CRON[Cron Scheduler (node-cron)]
        API[Express API]
        QUEUE[Redis Queue (BullMQ)]
        WORKER[Import Worker(s)]
        MONGO[MongoDB]
        LOGS[ImportLog Collection]
        JOBS[Job Collection]
    end

    CRON -- Hourly / Manual Trigger --> QUEUE
    API -- /api/import --> QUEUE
    QUEUE -- Job Payload --> WORKER
    WORKER -- Upsert Jobs --> JOBS
    WORKER -- Write ImportLog --> LOGS
```

### How It Works

1. **Initiation:** A cron job or a POST to `/api/import` enqueues import tasks.  
2. **Queueing:** Jobs are placed on a Redis queue via BullMQ.  
3. **Processing:** Workers fetch XML, convert to JSON, deduplicate, and upsert into MongoDB while writing ImportLog stats.  
4. **Admin UI:**  
   * Fetches historical data from `/api/history`.  
   * Subscribes to `/api/progress` for live updates.  
5. **Storage:** All job data and import logs reside in MongoDB.

---

## 📦 Project Structure

```
root/
 ├─ docker-compose.yml
 ├─ server/
 │  ├─ Dockerfile
 │  ├─ package.json
 │  ├─ src/
 │  │  ├─ index.js
 │  │  ├─ config/
 │  │  ├─ models/
 │  │  ├─ services/
 │  │  ├─ workers/
 │  │  └─ routes/
 │  ├─ tests/
 │  └─ scripts/
 ├─ client/
 │  ├─ Dockerfile
 │  ├─ package.json
 │  ├─ next.config.js
 │  ├─ pages/
 │  └─ components/
 ├─ docs/
 └─ README.md
```


## 🛠️ Setup & Usage

### 1\. Prerequisites

Before you begin, ensure you have:

  * **[Docker Desktop](https://www.docker.com/products/docker-desktop/):** Essential for running the entire stack.
  * **Node.js 18+:** Required for local development and testing (though Docker handles runtime for deployed services).

> **Important:** Remember to add `node_modules` and `.env` to your `.gitignore` to prevent committing them to your repository.

### 2\. Clone & Configure

Start by cloning the repository and navigating into the project directory:

```bash
git clone https://github.com/vijayshreepathak/JobImport-Hub.git
cd JobImport-Hub
```

If a `.env.example` file is provided in the `server/` directory, copy it to `server/.env` and fill in your specific environment variables.

```bash
# Example (adjust path if needed):
cp server/.env.example server/.env
```

### 3\. Start All Services

With Docker Desktop running, you can launch all services (MongoDB, Redis, Backend, Frontend) using Docker Compose:

```bash
docker compose up --build
```

Once services are up:

  * **Frontend UI:** Access the admin dashboard at [http://localhost:3000](https://www.google.com/search?q=http://localhost:3000)
  * **Backend API:** Explore API endpoints, for example, import history at [http://localhost:4000/api/history](https://www.google.com/search?q=http://localhost:4000/api/history)

### 4\. Trigger a Manual Import

You can trigger an import operation for all configured feeds via a simple API call.

  * **POST** `http://localhost:4000/api/import`: Initiates an import for all feeds defined in the `IMPORT_FEEDS` environment variable.
  * **GET** `http://localhost:4000/api/history`: Retrieves paginated import logs.
  * **GET** `http://localhost:4000/api/progress`: Establishes an SSE connection for live import progress updates.
  * **GET** `http://localhost:4000/api/jobs`: Fetches and parses jobs from all configured feeds (useful for testing/demo purposes without upserting).

#### Example using `curl`:

```bash
curl -X POST http://localhost:4000/api/import
```

You should receive a confirmation like:

```json
{ "status": "enqueued", "feeds": [ "feed1_url", "feed2_url" ] }
```

-----

## 🖥️ Frontend Walkthrough

The Next.js admin UI provides an intuitive interface for monitoring and reviewing job imports:

  * **Dashboard (`/`):** Offers a live overview of the current import status, updating in real-time via SSE.
  * **History (`/history`):** Presents a paginated and filterable table of all past import runs, including critical metrics like total jobs, new jobs added, updated jobs, and any failures.

-----

## 🧪 Running Tests

Unit tests are crucial for maintaining the quality and reliability of JobImport-Hub.

### Unit Tests (Jest + ESM)

Tests are written using modern ES modules (`import`/`export`) and executed with Jest v29+. An example test, `server/tests/xmlParser.test.js`, demonstrates how XML parsing and normalization logic is verified.

To run the backend tests:

```bash
cd server
npm install
npm run test
```

> **Note:** Running these tests does **not** interact with your database or affect the UI. They solely validate the parsing and data normalization logic.

-----

## ⚙️ Environment Variables

JobImport-Hub is configured primarily through environment variables, allowing for flexible deployment and management:

  * `MONGO_URI`: Connection string for MongoDB (e.g., `mongodb://mongo:27017/job_importer`)
  * `REDIS_URL`: Connection string for Redis (e.g., `redis://redis:6379`)
  * `IMPORT_FEEDS`: A comma-separated list of XML job feed URLs to be imported.
  * `PORT`: The port on which the Express API server will listen (default: `4000`).
  * `WORKER_CONCURRENCY`: The number of concurrent jobs the BullMQ worker can process (default: `5`).

These variables should be set in your `server/.env` file or directly in your Docker Compose configuration, depending on your deployment strategy.

-----

## 💡 Use Cases

JobImport-Hub is ideal for scenarios requiring robust job feed processing, such as:

  * **Job Board Aggregation:** Efficiently collect and manage job listings from various sources onto a centralized platform.
  * **Auditing & Tracking:** Maintain a detailed history of all import activities, including successes and failures, for compliance and analysis.
  * **Real-time Monitoring:** Keep a pulse on your import pipeline with live status updates.
  * **Scalable Data Ingestion:** Process large volumes of job data reliably using a queue-based system.

-----

## 📚 Further Documentation

For more in-depth information, explore our dedicated documentation:

  * **`docs/architecture.md`**: Delve deeper into scaling strategies, sharding, and advanced worker configurations.
  * **`docs/deployment.md`**: Find guides for deploying JobImport-Hub to platforms like Render, Vercel, or Kubernetes.

-----

## ✅ Project Status

JobImport-Hub is:

  * **Fully Functional & Tested:** The backend, frontend, queueing system, and XML parser have all been thoroughly tested and are working reliably.
  * **Production-Ready:** Designed with scalability and maintainability in mind, making it suitable for production environments or as a solid foundation for further customization.

-----

## 📝 GitHub Best Practices

When contributing or managing this repository, please adhere to the following best practices:

  * **Exclude Binaries:** **Do NOT commit `node_modules` or `.env` files** to your repository.
  * **Utilize `.gitignore`:** Ensure your `.gitignore` file is properly configured to exclude unnecessary files and directories.
  * **Commit Source Code Only:** Only commit source code, configuration files (like `next.config.js`), and lock files (`package.json`, `package-lock.json`).

-----

Made with ❤️ by Vijayshree Vaibhav | 7x Hackathon Winner

If you encounter any issues or have suggestions for improvements, please feel free to open an issue or submit a pull request\!
