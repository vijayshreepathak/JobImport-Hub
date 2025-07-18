# Scalable Job Importer with Queue Processing and History Tracking

## 🚀 Overview
A production-ready, scalable job feed importer that fetches multiple XML job feeds, deduplicates and upserts jobs into MongoDB, tracks import history, and provides a beautiful real-time admin UI. Built with Next.js, Express, MongoDB, Redis, BullMQ, and Docker Compose.

---

## ✨ Features
- **Fetches multiple XML job feeds hourly or on demand**
- **Converts XML to JSON, deduplicates, and upserts into MongoDB**
- **Uses Redis + BullMQ for queueing and concurrency**
- **Logs each import run (total, new, updated, failed)**
- **Next.js admin UI: live dashboard & import history**
- **Docker Compose for local/dev/prod**
- **Fully environment-variable driven**
- **Automated tests for XML parsing and normalization (Jest + ESM)**

---

## 🏗️ Architecture

```mermaid
graph TD;
  subgraph Server
    CRON[Cron (node-cron)]
    API[Express API]
    QUEUE[Redis Queue (BullMQ)]
    WORKER[Import Worker(s)]
    MONGO[(MongoDB)]
    LOGS[ImportLog]
    JOBS[Job]
  end
  subgraph Client [Next.js Admin UI]
    UI[Dashboard & History Table]
    SSE[Live Updates (SSE)]
  end
  CRON -- "Hourly/Manual Trigger" --> QUEUE
  API -- "/api/import" --> QUEUE
  QUEUE -- "Job Payload" --> WORKER
  WORKER -- "Upsert Jobs, Log History" --> MONGO
  WORKER -- "ImportLog" --> LOGS
  UI -- "Fetch /api/history" --> API
  UI -- "SSE /api/progress" --> API
```

---

## 📦 Project Structure

```
root/
 ├─ docker-compose.yml
 ├─ server/
 │   ├─ Dockerfile
 │   ├─ package.json
 │   ├─ .env.example
 │   ├─ src/
 │   │   ├─ index.js
 │   │   ├─ config/
 │   │   │   ├─ mongo.js
 │   │   │   └─ redis.js
 │   │   ├─ models/
 │   │   │   ├─ Job.js
 │   │   │   └─ ImportLog.js
 │   │   ├─ services/
 │   │   │   ├─ jobFetcher.js
 │   │   │   ├─ queue.js
 │   │   │   └─ cron.js
 │   │   ├─ workers/
 │   │   │   └─ importWorker.js
 │   │   └─ routes/
 │   │       └─ api.js
 │   ├─ tests/
 │   │   └─ xmlParser.test.js
 │   └─ scripts/
 │       └─ manualImport.js
 └─ client/
     ├─ Dockerfile
     ├─ package.json
     ├─ next.config.js
     ├─ pages/
     │   ├─ index.jsx
     │   └─ history.jsx
     └─ components/
         ├─ Layout.jsx
         └─ ImportHistoryTable.jsx
 ├─ docs/
 │   ├─ architecture.md
 │   └─ deployment.md
 ├─ README.md
```

---

## 🧪 Running Tests

### **Unit Tests (Jest + ESM)**

- Tests are written using ES modules (`import`/`export`) and run with Jest v29+.
- Example test: `server/tests/xmlParser.test.js` (parses and normalizes XML job feeds).

**To run tests:**

```sh
cd server
npm run test
```

If you see ESM-related errors, make sure:
- You are using Node.js 18+.
- Your `server/package.json` has: `"type": "module"`.
- Your test script is:
  ```json
  "test": "node --experimental-vm-modules ./node_modules/jest/bin/jest.js"
  ```
- Your `jest.config.js` does **not** include `extensionsToTreatAsEsm`.

---

## 🛠️ Setup & Usage

### **1. Prerequisites**
- [Docker Desktop](https://www.docker.com/products/docker-desktop/)
- Node.js 18+ (for local dev/testing)

### **2. Clone & Configure**
```sh
git clone <your-repo-url>
cd "Scalable job importer with Queue Processing and History Tracking"
cp server/.env.example server/.env
```

### **3. Start All Services**
```sh
docker compose up --build
```
- Frontend: [http://localhost:3000](http://localhost:3000)
- Backend API: [http://localhost:4000/api/history](http://localhost:4000/api/history)

### **4. Trigger Manual Import (Postman or curl)**
- **POST** `http://localhost:4000/api/import`
- **GET** `http://localhost:4000/api/history`

#### **Postman Example:**
- Import the following request:
  - Method: `POST`
  - URL: `http://localhost:4000/api/import`
  - No body required
- You should see a response like:
  ```json
  { "message": "Import started" }
  ```

---

## 💡 Use Cases
- Aggregating jobs from multiple feeds for a job board
- Tracking import history and failures for auditing
- Real-time monitoring of import status
- Scalable, queue-based processing for large feeds

---

## 📚 Documentation
- See `docs/architecture.md` for scaling, sharding, and worker details
- See `docs/deployment.md` for deployment to Render, Vercel, or Kubernetes

---

## ✅ Project Status
- **Fully working and tested** (backend, frontend, queue, and XML parser)
- **Ready for production or further customization**
