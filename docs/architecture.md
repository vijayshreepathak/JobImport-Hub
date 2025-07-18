# Scalable Job Importer

A production-ready, scalable job feed importer with queue processing, import history, and a real-time admin UI.

## Features

- Fetches multiple XML job feeds hourly (or on demand)
- Converts XML to JSON, deduplicates, and upserts into MongoDB
- Uses Redis + BullMQ for queueing and concurrency
- Logs each import run (total, new, updated, failed)
- Next.js admin UI: live dashboard & import history
- Docker Compose for local/dev/prod
- Fully environment-variable driven

## Quick Start

```sh
git clone <repo>
cd Scalable\ job\ importer\ with\ Queue\ Processing\ and\ History\ Tracking
cp server/.env.example server/.env
# Edit server/.env as needed
docker-compose up --build
```

- Server: [http://localhost:4000](http://localhost:4000)
- Client: [http://localhost:3000](http://localhost:3000)

## Environment Variables

See `server/.env.example` for all options.

## Commands

- `npm run dev` — start in dev mode (with hot reload)
- `npm run start` — start in prod mode
- `npm run lint` — lint code
- `npm run test` — run tests
- `npm run manual-import` — trigger import manually

## Troubleshooting

- Ensure MongoDB and Redis are healthy (`docker ps`)
- Check logs: `docker-compose logs -f server`
- For CORS issues, ensure client/server ports match

## License

MIT
