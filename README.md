# JobImport-Hub

-----

## 🚀 Overview

JobImport-Hub is a robust, production-ready solution designed for efficient job feed aggregation. It automatically fetches multiple XML job feeds, intelligently deduplicates and upserts jobs into MongoDB, meticulously tracks import history, and provides a sleek, real-time administrative user interface. Built with a modern stack including **Next.js**, **Express**, **MongoDB**, **Redis**, and **BullMQ**, and orchestrated with **Docker Compose**, this system offers a scalable and reliable foundation for any job board or aggregation platform.

-----

## ✨ Key Features

  * **Automated & On-Demand Imports:** Schedule hourly imports or trigger them manually for multiple XML job feeds.
  * **Intelligent Data Processing:** Converts XML to JSON, then deduplicates and efficiently upserts job data into MongoDB.
  * **Scalable Queueing:** Leverages **Redis** and **BullMQ** for robust job queuing and concurrent processing, ensuring high throughput.
  * **Comprehensive Logging:** Tracks every import run, detailing total jobs processed, new additions, updates, and failures.
  * **Real-time Admin UI (Next.js):**
      * **Live Dashboard:** Monitor import progress in real-time via Server-Sent Events (SSE).
      * **Import History:** View a detailed history of all import runs, complete with statistics.
  * **Containerized Deployment:** Seamless local, development, and production deployments powered by **Docker Compose**.
  * **Flexible Configuration:** Fully driven by environment variables for easy customization.
  * **Rigorous Testing:** Automated tests (Jest + ESM) ensure reliable XML parsing and data normalization.

-----

## 🏗️ System Architecture

JobImport-Hub employs a microservices-inspired architecture, ensuring modularity, scalability, and resilience.

```mermaid
graph TD;
  subgraph Client [Next.js Admin UI]
    UI[Dashboard & History Table]
    SSE[Live Updates (SSE)]
  end
  subgraph Server Backend
    CRON[Cron Scheduler (node-cron)]
    API[Express API]
    QUEUE[Redis Queue (BullMQ)]
    WORKER[Import Worker(s)]
    MONGO[(MongoDB Database)]
    LOGS[ImportLog Collection]
    JOBS[Job Collection]
  end
  CRON -- "Hourly/Manual Trigger" --> QUEUE
  API -- "/api/import Request" --> QUEUE
  QUEUE -- "Job Payload" --> WORKER
  WORKER -- "Upsert Jobs, Log History" --> MONGO
  WORKER -- "Write ImportLog" --> LOGS
  WORKER -- "Write Job Data" --> JOBS
  UI -- "Fetch /api/history" --> API
  UI -- "SSE /api/progress" --> API
```

### How It Works:

1.  **Initiation:** Imports are triggered either automatically by a **Cron Scheduler** (using `node-cron`) or manually via an API endpoint (`/api/import`) exposed by the **Express API**.
2.  **Queueing:** Triggered imports are pushed as job payloads onto a **Redis Queue** managed by **BullMQ**. This decouples the import initiation from the processing, enabling asynchronous and scalable operations.
3.  **Processing:** Dedicated **Import Workers** consume jobs from the Redis Queue. Each worker handles:
      * Fetching and parsing XML job feeds.
      * Converting XML data to a standardized JSON format.
      * Deduplicating jobs to prevent duplicates.
      * Upserting (inserting new or updating existing) job records into the **MongoDB Job Collection**.
      * Recording detailed statistics of each import run (total, new, updated, failed jobs) into the **MongoDB ImportLog Collection**.
4.  **Admin UI Interaction:**
      * The **Next.js Admin UI** fetches historical import data from the Express API (`/api/history`).
      * For real-time progress updates during active imports, the UI subscribes to **Server-Sent Events (SSE)** from the Express API (`/api/progress`).
5.  **Data Storage:** **MongoDB** serves as the primary data store for both job listings and import history logs.

-----

## 📦 Project Structure

```
root/
 ├─ docker-compose.yml             # Defines services for Docker Compose
 ├─ server/                        # Backend (Node.js/Express)
 │  ├─ Dockerfile                  # Dockerfile for the backend service
 │  ├─ package.json                # Backend dependencies and scripts
 │  ├─ src/                        # Backend source code
 │  │  ├─ index.js                 # Main server entry point
 │  │  ├─ config/                  # Database & Redis connection configurations
 │  │  ├─ models/                  # Mongoose models (Job, ImportLog)
 │  │  ├─ services/                # Core business logic (job fetching, queue, cron)
 │  │  ├─ workers/                 # BullMQ worker for processing import jobs
 │  │  └─ routes/                  # API routes
 │  ├─ tests/                      # Unit tests for backend logic
 │  └─ scripts/                    # Utility scripts (e.g., manual import)
 ├─ client/                        # Frontend (Next.js)
 │  ├─ Dockerfile                  # Dockerfile for the frontend service
 │  ├─ package.json                # Frontend dependencies and scripts
 │  ├─ next.config.js              # Next.js configuration
 │  ├─ pages/                      # Next.js pages (dashboard, history)
 │  └─ components/                 # Reusable React components
 ├─ docs/                          # Additional documentation
 │  ├─ architecture.md             # In-depth architecture details (e.g., scaling)
 │  └─ deployment.md               # Deployment guides
 └─ README.md                      # This README file
```

-----

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
