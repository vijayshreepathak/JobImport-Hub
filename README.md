# JobImport-Hub
-----

## 🚀 Overview

JobImport-Hub is a robust, production-ready solution for efficient job-feed aggregation. It automatically fetches multiple XML feeds, deduplicates and upserts jobs into MongoDB, tracks import history, and exposes a real-time admin UI. Built with **Next.js**, **Express**, **MongoDB**, **Redis**, **BullMQ**, and orchestrated by **Docker Compose**, it provides a scalable and reliable foundation for any job board or data aggregation platform.

-----

## ✨ Key Features

  * **Automated & On-Demand Imports:** Schedule hourly imports or trigger them manually for any number of XML feeds.
  * **Intelligent Data Processing:** Efficiently converts XML to JSON, deduplicates jobs based on a unique ID, and upserts the data into MongoDB.
  * **Scalable Queueing:** Uses **Redis** + **BullMQ** for high-throughput, reliable background job processing.
  * **Comprehensive Logging:** Records totals, new, updated, and failed jobs for every import run, providing full auditability.
  * **Real-time Admin UI (Next.js):**
      * **Live Dashboard:** View import progress in real-time via Server-Sent Events (SSE).
      * **Import History:** Browse detailed statistics and metadata for all previous runs.
  * **Containerized Deployment:** One-command local, staging, and production stacks via **Docker Compose**.
  * **Flexible Configuration:** All settings are driven by environment variables for easy management across different environments.
  * **Rigorous Testing:** Includes Jest + ESM tests for core XML parsing and data-normalization logic.

-----

## 🏗️ System Architecture

*The diagram below illustrates the flow of data and interaction between the system's components.*

```mermaid
graph TD
    subgraph User Interaction
        Admin([👩‍💻 Admin User])
    end

    subgraph "Frontend (Client)"
        style "Frontend (Client)" fill:#D6EAF8,stroke:#333,stroke-width:2px
        UI_Dashboard["Live Dashboard</br>(localhost:3000)"]
        UI_History["History Page</br>(localhost:3000)"]
    end

    subgraph "Backend (Server)"
        style "Backend (Server)" fill:#D5F5E3,stroke:#333,stroke-width:2px
        API["Express API Server</br>(/api/import, /api/history, /api/progress)"]
        Cron["Node-Cron Scheduler</br>(Hourly Trigger)"]
        Queue["BullMQ Queue</br>(import-queue)"]
        Worker["Background Worker</br>(Processes Feeds)"]
    end

    subgraph "Databases & Services"
        style "Databases & Services" fill:#FCF3CF,stroke:#333,stroke-width:2px
        MongoDB["MongoDB</br>(Stores Jobs & Logs)"]
        Redis["Redis</br>(Queue Broker)"]
        ExternalFeeds([🌐 External XML Feeds])
    end

    %% --- Connections ---
    Admin -- "1. Triggers Manual Import" --> UI_Dashboard
    Admin -- "Views Past Imports" --> UI_History

    UI_Dashboard -- "2. POST /api/import" --> API
    UI_Dashboard -- "6. SSE Connection</br>/api/progress" --> API

    API -- "3. Enqueues Jobs" --> Queue
    Cron -- "Alt. Trigger (Hourly)" --> Queue

    Queue -- "Linked via" --> Redis
    Queue -- "4. Sends Job Payload" --> Worker

    Worker -- "5. Fetches XML" --> ExternalFeeds
    Worker -- "5a. Upserts/Updates Jobs" --> MongoDB
    Worker -- "5b. Writes Import Log" --> MongoDB
    Worker -- "Reports Live Progress" --> API

    UI_History -- "Fetches Data</br>GET /api/history" --> API
    API -- "Reads Logs" --> MongoDB

```

### How It Works

1.  **Initiation:** An import process is started either automatically by a **Cron Scheduler** (hourly) or manually when an admin clicks the "Trigger Import" button on the UI, which sends a `POST` request to the `/api/import` endpoint.
2.  **Queueing:** For each XML feed, the API server adds a job to the **BullMQ Queue**, which is backed by **Redis**. This ensures jobs are processed reliably and don't get lost.
3.  **Processing:** A background **Worker** listens to the queue. When it receives a job, it fetches the XML data, parses it, and iterates through each job listing. It then performs an `upsert` operation in **MongoDB**, either creating a new job document or updating an existing one.
4.  **Logging:** The worker tracks the number of new and updated jobs and writes a detailed log to an `ImportLog` collection in MongoDB upon completion or failure.
5.  **Admin UI:**
      * The dashboard establishes a Server-Sent Events (SSE) connection to `/api/progress` to receive and display live updates from the worker.
      * The history page fetches all past import logs from the `/api/history` endpoint.
6.  **Storage:** All job data and import logs are stored permanently in **MongoDB**.

-----

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
│  └─ tests/
└─ client/
   ├─ Dockerfile
   ├─ package.json
   ├─ next.config.js
   ├─ pages/
   └─ components/
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
  * **GET** `http://localhost:4000/api/jobs`: Fetches all jobs from the database.

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
