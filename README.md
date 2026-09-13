# Production-Grade API

A production-style backend API built to demonstrate the engineering practices I use when designing scalable services.

## Engineering goals

- Strong module boundaries and dependency inversion
- REST + GraphQL APIs
- PostgreSQL persistence with TypeORM
- Redis caching with explicit invalidation
- Pagination and input validation
- Health/readiness checks
- Prometheus metrics
- Request IDs and structured application logging
- Security headers, CORS and rate limiting
- Graceful shutdown
- Dockerized local environment
- Automated CI with lint, build and tests
- Database migrations
- Unit and e2e tests

> This repository is intentionally a single deployable service. The domain modules are isolated so a high-load or high-change domain can be extracted into a separate service later without turning the initial system into unnecessary microservice complexity.

## Architecture

```text
Clients
   |
   +----------------------+
   |                      |
   v                      v
 REST /api/v1         GraphQL /graphql
   |                      |
   +----------+-----------+
              |
              v
       Application Layer
        Task Module
              |
       +------+------+
       |             |
       v             v
 PostgreSQL        Redis
       |
       v
   TypeORM

Cross-cutting:
Validation · Rate limiting · Request ID · Logging · Health · Metrics

Runtime:
Docker Compose → API + PostgreSQL + Redis
CI:
GitHub Actions → lint → test → build
```

## Stack

- Node.js + TypeScript
- NestJS
- REST + GraphQL
- PostgreSQL
- TypeORM
- Redis / ioredis
- Prometheus / prom-client
- Docker Compose
- Jest + Supertest
- GitHub Actions

NestJS officially supports GraphQL, TypeORM, testing, validation, rate limiting, health checks and other production-oriented techniques; this project follows those integration patterns. 

## Local development

### Prerequisites

- Node.js 20+
- npm 10+
- Docker Desktop

### 1. Start infrastructure

```bash
docker compose up -d postgres redis
```

### 2. Install dependencies

```bash
npm install
```

### 3. Configure environment

```bash
copy .env.example .env
```

On macOS/Linux:

```bash
cp .env.example .env
```

### 4. Run migrations

```bash
npm run migration:run
```

### 5. Start the API

```bash
npm run start:dev
```

The API is available at:

- REST: `http://localhost:3000/api/v1/tasks`
- GraphQL: `http://localhost:3000/graphql`
- Health: `http://localhost:3000/health`
- Readiness: `http://localhost:3000/ready`
- Metrics: `http://localhost:3000/metrics`

## REST examples

Create a task:

```bash
curl -X POST http://localhost:3000/api/v1/tasks \
  -H "Content-Type: application/json" \
  -d "{\"title\":\"Build production API\",\"description\":\"Add Redis caching and observability\"}"
```

List tasks:

```bash
curl "http://localhost:3000/api/v1/tasks?page=1&limit=20"
```

Get one task:

```bash
curl http://localhost:3000/api/v1/tasks/<id>
```

Update a task:

```bash
curl -X PATCH http://localhost:3000/api/v1/tasks/<id> \
  -H "Content-Type: application/json" \
  -d "{\"status\":\"DONE\"}"
```

Delete a task:

```bash
curl -X DELETE http://localhost:3000/api/v1/tasks/<id>
```

## GraphQL example

Open `http://localhost:3000/graphql` in development.

```graphql
query {
  tasks(page: 1, limit: 20) {
    items {
      id
      title
      status
      createdAt
    }
    page
    limit
    total
  }
}
```

## Testing

Unit tests:

```bash
npm test
```

Coverage:

```bash
npm run test:cov
```

End-to-end tests:

```bash
npm run test:e2e
```

## Database migrations

Generate a migration after changing entities:

```bash
npm run migration:generate -- src/database/migrations/YourMigrationName
```

Run migrations:

```bash
npm run migration:run
```

Revert the latest migration:

```bash
npm run migration:revert
```

## Production-minded decisions

### Cache-aside

Task reads are cached in Redis. Writes invalidate the affected cache keys so stale task lists are not retained indefinitely.

### Pagination

List endpoints require bounded pagination. The service caps `limit` to avoid accidentally requesting an unbounded dataset.

### Validation

DTOs reject malformed input before it reaches the application layer.

### Graceful shutdown

The application enables shutdown hooks so resources can be closed cleanly during container termination.

### Health vs readiness

`/health` reports basic process health. `/ready` checks dependencies required to serve traffic.

### Observability

The `/metrics` endpoint exposes Prometheus-compatible metrics, including HTTP request counts and latency.

### Security

Helmet, CORS, request throttling, payload limits and validation are enabled at the HTTP boundary.

## What I would add next

- JWT/OIDC authentication
- RBAC
- OpenAPI/Swagger contract
- Outbox pattern
- Kafka event publishing
- Distributed tracing with OpenTelemetry
- Redis distributed locks where justified
- Load testing with k6
- Kubernetes manifests and Helm chart
- SLOs and alert rules
- Dependency and container scanning

## Author

**Anupam Roy**

Backend Engineer · Distributed Systems · APIs · Cloud

- GitHub: https://github.com/anupam-1999
- LinkedIn: https://www.linkedin.com/in/anupam-roy-384ba917/
