# Drawmatic Docker

## Quick start

```bash
cp .env.example .env
# Edit NEXTAUTH_SECRET in .env

docker compose up --build
```

- Dev portal: http://localhost:8081 (links to app + database UI)
- App: http://localhost:3001
- Mongo Express: http://localhost:8082 (no browser login popup in local Docker)
- MongoDB: only on the Docker network (`mongodb:27017`, database `drawmatic`). To connect from the host, add `ports: ["127.0.0.1:27027:27017"]` under `mongodb` in `docker-compose.yml`.
