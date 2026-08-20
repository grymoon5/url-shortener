# Development Notes

This document records problems encountered during implementation, their verified causes, and the resulting decisions.

## 1. Direct PostgreSQL connection failure

### Problem

The application could not reach PostgreSQL directly on port `5432`.

### Finding

The failure occurred at the network connection stage, before a database query completed. It was not caused by the short-code generator.

### Decision

The application now uses the server-side Supabase JavaScript client and HTTPS Data API.

### Lesson

Diagnose connection failures by layer:

1. DNS
2. Network access
3. Authentication
4. Query execution
5. Application logic

## 2. Request-property mismatch

### Problem

URL validation received no value even though the user entered a URL.

### Cause

The frontend and backend used different request-property names.

### Resolution

The current request contract is:

```javascript
body: JSON.stringify({
  url: originalUrl,
})
```

Express reads the same property through `request.body.url`.

### Lesson

Request-property names must match exactly across the frontend, tests, and backend.

## 3. Database column mismatch

### Problem

Database inserts and lookups used inconsistent column names.

### Cause

The code referred to both `originalurl` and `original_url`.

### Resolution

The current mapping is explicit:

- API request property: `url`
- Backend variable: `originalUrl`
- Database column: `original_url`

### Lesson

Naming conventions may differ between layers. The mapping between them must remain consistent.

## 4. Temporary diagnostic response

### Problem

The POST route returned HTTP `200` before validation or database insertion ran.

### Cause

A temporary diagnostic response used an unconditional `return`. The remaining route code was unreachable.

### Resolution

The temporary response was removed. The route now validates the request, writes to Supabase, and returns the result.

### Lesson

Remove temporary responses after diagnosis. Code after an unconditional `return` cannot execute.

## 5. Persistent storage

### Initial implementation

URL mappings were stored in a JavaScript `Map`.

### Limitation

In-memory mappings were lost when the Node.js process stopped.

### Current implementation

URL mappings are written to the Supabase `links` table. Redirect requests retrieve their destination from the same table.

### Lesson

In-memory storage is appropriate for a prototype. Persistent storage is required when data must survive application restarts.

## 6. Stale server process

### Problem

Changes to the health endpoint and POST route did not appear in responses.

### Cause

An older Node.js process still owned port `3000`, so requests reached the previous application version.

### Resolution

The stale process was stopped and the server was restarted from the application directory.

### Lesson

When code changes do not appear, verify the process that owns the configured port before changing application logic.

## 7. Secret management

### Problem

GitHub rejected a push because an earlier commit contained a Supabase secret in `.env`.

### Cause

The inner application repository did not have its own `.gitignore`, and `.env` had already been committed.

### Resolution

The repository now ignores `.env`, keeps `.env.example` for placeholders, and no longer tracks the local `.env` file.

### Lesson

Ignoring a file does not remove it from existing Git history. Exposed secrets must be rotated and removed from the commits being pushed.

## Verified scope

The repository currently includes:

- URL validation for HTTP and HTTPS
- Six-character short-code generation
- Supabase-backed link creation and lookup
- HTTP `302` redirects
- Health, validation, and short-code tests

The automated test suite currently contains 11 passing tests. Browser behavior and mobile layout are not covered by automated tests.
