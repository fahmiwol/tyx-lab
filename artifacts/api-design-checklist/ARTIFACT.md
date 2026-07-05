# API Design & Contract Checklist

## Purpose
Comprehensive checklist for designing REST and async APIs for digital platforms. Covers endpoint design, validation, error handling, security, documentation, and provider abstraction.

## Pre-Design Phase

- [ ] Define API consumers (web frontend, mobile, third-party, internal services)
- [ ] List all features that will have API endpoints
- [ ] Identify async workflows (job queues, webhooks, background tasks)
- [ ] Plan authentication method (JWT, OAuth2, API keys, session cookies)
- [ ] Decide on API versioning strategy (path-based /v1/, header-based, or unified)
- [ ] Choose response format (JSON-only, JSON+hypermedia)
- [ ] Document rate-limiting and quota strategy per user/role

## Endpoint Design

### Naming & Structure

- [ ] Use RESTful resource paths: /users, /posts/{id}/comments, /listings/{id}?category=waste
- [ ] Prefer nouns over verbs: /posts not /get-posts or /list-posts
- [ ] Consistent pluralization (all plural or all singular per resource)
- [ ] Include resource hierarchy where relevant: /users/{userId}/posts/{postId}
- [ ] Use query params for filtering, sorting, pagination: ?status=published&sort=-created_at&limit=10
- [ ] Use path params for identity: /posts/{id}, /listings/{id}

### HTTP Methods

- [ ] GET: Read-only, cacheable, idempotent, no body
- [ ] POST: Create new resource, may have side effects
- [ ] PUT/PATCH: Update existing resource (PUT=full replacement, PATCH=partial update)
- [ ] DELETE: Remove resource, idempotent
- [ ] HEAD: Like GET, but no response body (for existence checks)
- [ ] OPTIONS: Describe communication options (CORS preflight)

### Response Shape

Success Response (2xx):
- data: resource or array
- meta: timestamp, version

Paginated List:
- data: items array
- pagination: page, limit, total, pages

Error Response:
- error: code, message, status, details (field-level)

### Async/Job Endpoints

- [ ] POST /jobs or /{resource}/jobs: Initiate long-running operation
- [ ] Response includes job_id and polling endpoint
- [ ] GET /jobs/{job_id}: Poll for status (draft, queued, processing, completed, failed)
- [ ] Optional: Webhook callback on completion (signature verification required)
- [ ] Define job timeout and retry policy

## Input Validation

- [ ] Use strict Zod/JSON Schema contracts for request bodies
- [ ] Validate all user inputs before processing
- [ ] Return 422 (Unprocessable Entity) with field-level errors
- [ ] Reject unknown fields (no silent pass-through)
- [ ] File uploads: Check MIME type, file size, content scan
- [ ] Sanitize string inputs to prevent XSS
- [ ] Validate location, date, numeric ranges at endpoint level

## HTTP Status Codes

- [ ] 200 OK: Successful GET, PUT, PATCH
- [ ] 201 Created: Successful POST (include Location header or id in response)
- [ ] 204 No Content: Successful DELETE or action with no body
- [ ] 400 Bad Request: Malformed request, validation failure
- [ ] 401 Unauthorized: Missing or invalid authentication
- [ ] 403 Forbidden: Authenticated but unauthorized (permission denied)
- [ ] 404 Not Found: Resource doesn't exist
- [ ] 409 Conflict: State conflict (e.g., listing already sold)
- [ ] 422 Unprocessable Entity: Validation error (structured field errors)
- [ ] 429 Too Many Requests: Rate limit exceeded
- [ ] 500 Internal Server Error: Unexpected server error
- [ ] 503 Service Unavailable: Maintenance or provider down

## Authentication & Authorization

- [ ] All write endpoints require authentication
- [ ] All admin endpoints require role check (middleware)
- [ ] Include user context in request (via token claims or session)
- [ ] Endpoints return 403 if user lacks permission (not 404)
- [ ] API keys or JWT tokens include expiry and scope
- [ ] Rotate secrets regularly; support multiple valid keys during rollover
- [ ] Log all authorization failures for audit
- [ ] Separate auth check from permission check in code

## Security

- [ ] Use HTTPS only (no HTTP)
- [ ] Implement CORS headers correctly (whitelist origins)
- [ ] Include CSRF token for state-changing operations (if using cookies)
- [ ] Do not expose internal error details in production (use error codes, not stack traces)
- [ ] Sanitize all inputs; use parameterized queries (never string concat in SQL)
- [ ] Do not log passwords, tokens, or sensitive data
- [ ] Rate-limit by IP and/or user to prevent brute force and DDoS
- [ ] Validate webhook signatures before processing
- [ ] Do not return sensitive data (emails, phone) unless authenticated and authorized

## Error Handling

- [ ] Define standard error code enum (INVALID_INPUT, NOT_FOUND, UNAUTHORIZED, etc.)
- [ ] Include error code and human-readable message in every error response
- [ ] For validation errors, include field-level details (field name, reason)
- [ ] For async job failures, include retry status and next action
- [ ] Implement idempotency keys for POST endpoints (prevent duplicate writes on retry)
- [ ] Provide a request_id in every response for debugging/logging

## Documentation

- [ ] OpenAPI/Swagger spec (auto-generated or hand-written)
- [ ] Per-endpoint documentation: purpose, auth requirement, parameters, request/response examples
- [ ] Error scenarios and status codes per endpoint
- [ ] Rate limits and quota per user role
- [ ] Pagination and filtering examples
- [ ] Async job polling example
- [ ] Webhook payload signature verification example
- [ ] SDKs or client libraries (if used by many consumers)
- [ ] Changelog for API versions (breaking changes highlighted)

## Testing

- [ ] Unit tests: Request validation, auth checks, permission logic
- [ ] Integration tests: Happy path, error cases, edge cases
- [ ] Auth tests: 401/403 responses, token expiry, role boundaries
- [ ] Async job tests: Status transitions, retry behavior, timeout
- [ ] Performance tests: Pagination limits, query N+1 prevention
- [ ] Security tests: SQL injection, XSS, CSRF, rate limiting
- [ ] Schema migration tests: Backward compatibility

## Versioning & Deprecation

- [ ] Establish API versioning strategy before launch
- [ ] Support at least two major versions for backwards compatibility
- [ ] Use sunset headers to announce deprecation (3-6 month notice)
- [ ] Provide migration guide for breaking changes
- [ ] Date-based versions (v2024.07) vs semantic (v1, v2) — pick one
- [ ] Do not change response shape of old versions (use new endpoints instead)

## Provider Abstraction (Multi-Vendor APIs)

- [ ] Define provider interface/contract (adapter pattern)
- [ ] Do not expose provider implementation details in API responses
- [ ] Route requests through provider router/adapter layer
- [ ] Handle provider failures gracefully (fallback to mock or queued state)
- [ ] Track which provider served each request (audit/observability)
- [ ] Normalize provider-specific error codes to standard codes
- [ ] Test all endpoints with mock provider enabled

## Monitoring & Observability

- [ ] Log all requests with: method, path, status, latency, user_id, request_id
- [ ] Track error rates by endpoint and error code
- [ ] Alert on high error rates or latency spikes
- [ ] Monitor rate limit usage per user
- [ ] Track async job queue depth and failure rates
- [ ] Trace provider latency and success rates
- [ ] Set up performance baseline (p50, p95, p99 latency per endpoint)

## Governance

- [ ] API design review before implementation
- [ ] Breaking changes require major version and migration plan
- [ ] All endpoints documented before release
- [ ] Security review for auth and data exposure
- [ ] Load test before production (especially async endpoints)
- [ ] Maintain API changelog in version control
- [ ] Establish API deprecation and sunset policy

---

*Open source — use it wisely.*
