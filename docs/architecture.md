# Architecture Notes

## Why a modular monolith first?

The project deliberately starts as one deployable service.

The goal is to demonstrate clear domain boundaries without introducing network calls, distributed transactions, service discovery, and operational overhead before the system needs them.

The `tasks` module owns its controller, resolver, service, DTOs and entity. Shared infrastructure such as Redis, database configuration, health and metrics is separated from the domain.

If task processing later becomes a separate workload, the module can publish domain events and be extracted behind a stable contract.

## Caching strategy

The read path uses cache-aside:

1. Check Redis.
2. Return cached page if present.
3. Query PostgreSQL on a cache miss.
4. Store the page with a short TTL.
5. Invalidate affected list keys after writes.

The example uses a bounded invalidation set so the behavior is easy to understand. A large production keyspace should use versioned keys or a controlled Redis `SCAN` strategy rather than blindly deleting arbitrary keys.

## Reliability direction

The next production hardening steps are:

- authentication and authorization
- idempotency keys for mutation endpoints
- transactional outbox for reliable event publication
- retry/backoff policies for external dependencies
- OpenTelemetry tracing
- load tests and SLOs
- Kubernetes probes and resource limits
