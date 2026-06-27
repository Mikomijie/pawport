# Security Documentation — PawPort

## Overview

PawPort implements defense-in-depth security across authentication, data handling, API protection, and infrastructure layers. This document details every security measure implemented.

---

## Authentication & Session Management

| Measure | Implementation |
|---------|---------------|
| Password hashing | bcryptjs with cost factor 12 |
| Password requirements | Minimum 8 characters, 1 uppercase, 1 number, max 128 characters |
| Session tokens | Cryptographically random CUIDs stored server-side in database |
| Session cookies | `httpOnly: true`, `secure: true` (production), `sameSite: lax`, scoped to `/` |
| Session expiry | 7-day sliding window, expired sessions return null |
| Cookie deletion | Only performed in server-side Route Handlers, never from Server Components |
| Credential storage | Only hashed passwords stored; plaintext never persisted or logged |

## Rate Limiting

| Endpoint | Limit | Window |
|----------|-------|--------|
| POST /api/auth/login | 5 attempts | 15 minutes per IP |
| POST /api/auth/register | 5 attempts | 15 minutes per IP |

- In-memory sliding window store
- Returns HTTP 429 with `Retry-After` header when exceeded
- `X-RateLimit-Remaining` header on responses
- IP extracted from `x-forwarded-for` or `x-real-ip` headers

## Input Validation & Sanitization

All user inputs are validated and sanitized before database writes:

| Field | Max Length | Sanitization |
|-------|-----------|--------------|
| User name | 100 chars | Trim, strip `<>` |
| Email | 255 chars | Trim, lowercase, regex validation |
| Password | 128 chars | Length + complexity check |
| Phone | 20 chars | Trim, strip `<>` |
| Cat name | 100 chars | Trim, strip `<>` |
| All text fields (breed, color, allergies, etc.) | 500 chars | Trim, strip `<>` |
| Care log notes | 500 chars | Trim, strip `<>` |
| Sighting message | 500 chars | Trim, strip `<>` |
| GPS latitude | — | Must be finite number between -90 and 90 |
| GPS longitude | — | Must be finite number between -180 and 180 |

- `sanitizeInput()` utility strips potential XSS vectors (`<` and `>` characters)
- All numeric inputs validated with `isFinite()` and `isNaN()` checks
- Care log types validated against allowlist of valid enum values
- PIN lookup validated against exact 6-digit pattern

## Mass Assignment Protection

The `PATCH /api/cats/[id]` route uses an explicit allowlist of updatable fields. Fields like `ownerId`, `pin`, `id`, and `createdAt` cannot be modified via API, preventing privilege escalation.

## Authorization

- All authenticated endpoints verify session before processing
- Cat operations verify `cat.ownerId === session.userId` (ownership check)
- Public endpoints (sighting, PIN lookup, cat profile view) are intentionally unauthenticated with limited data exposure
- Proxy (middleware) redirects unauthenticated users from `/dashboard` to `/login`

## Data Privacy

- **Privacy Settings model**: Owners control visibility of phone, address, feeding schedule, location, and GPS history
- **Public profile respects privacy flags**: Fields are conditionally rendered based on owner preferences
- **Selective data exposure**: Public cat GET endpoint only returns necessary profile fields
- **Sighting response**: Only returns `id`, `latitude`, `longitude`, `createdAt` — not internal `catId`

## HTTP Security Headers

Applied to all routes via `next.config.ts`:

| Header | Value |
|--------|-------|
| Content-Security-Policy | `default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval'; style-src 'self' 'unsafe-inline'; img-src 'self' data: blob: https://api.qrserver.com; connect-src 'self' https://openrouter.ai; frame-ancestors 'none'; base-uri 'self'; form-action 'self'` |
| X-Frame-Options | DENY |
| X-Content-Type-Options | nosniff |
| Referrer-Policy | strict-origin-when-cross-origin |
| Permissions-Policy | camera=(), microphone=(), geolocation=(self) |
| Strict-Transport-Security | max-age=31536000; includeSubDomains |
| X-DNS-Prefetch-Control | on |

## API Key Protection

- `OPENROUTER_API_KEY` is stored in `.env` (gitignored) and only accessed in server-side API route (`/api/cats/[id]/health-check`)
- `.env` is listed in `.gitignore` — never committed
- API key is never exposed to client-side code or included in responses
- `NEXT_PUBLIC_` prefix is NOT used for sensitive keys

## File Upload Security

- Allowed MIME types: `image/jpeg`, `image/png`, `image/webp`, `image/gif`
- Maximum file size: 5MB
- File extension validated from original filename
- Files stored in `public/uploads/` with randomized filenames (timestamp + random string)
- No path traversal possible — `path.join()` with fixed base directory

## Database Security

- All queries use Prisma's parameterized query builder — zero raw SQL string concatenation
- SQLite database file stored locally (not committed to git)
- Prisma Client generates type-safe queries preventing SQL injection by design
- Cascade deletes configured for data cleanup on user/cat deletion

## Temporal Workflow Security

- Temporal connection only from server-side code
- Workflow IDs are deterministic (`lost-cat-{catId}`) preventing unauthorized workflow manipulation
- Temporal errors are caught and logged — never exposed to API responses
- App continues to function if Temporal server is unavailable (graceful degradation)

## Environment Configuration

```
.env (local, gitignored)
├── DATABASE_URL — SQLite file path
├── AUTH_SECRET — Session signing secret
├── NEXT_PUBLIC_BASE_URL — Public URL (non-sensitive)
├── TEMPORAL_ADDRESS — Temporal server address
└── OPENROUTER_API_KEY — AI service key (server-only)
```

## Security Checklist

- [x] Passwords hashed with bcrypt (cost 12)
- [x] Session cookies: httpOnly, secure, sameSite
- [x] Rate limiting on auth endpoints
- [x] Input validation and sanitization on all routes
- [x] Input length limits enforced
- [x] Mass assignment protection via field allowlisting
- [x] GPS coordinate validation (type, range, finiteness)
- [x] Content Security Policy headers
- [x] X-Frame-Options: DENY (clickjacking protection)
- [x] HSTS enabled
- [x] API keys server-side only
- [x] No sensitive data in API responses
- [x] File upload type/size validation
- [x] Parameterized database queries (Prisma ORM)
- [x] Privacy controls for public data exposure
- [x] Graceful error handling (no stack traces in responses)

## Recommendations for Production

1. Switch from SQLite to PostgreSQL for concurrent access
2. Add CSRF tokens for state-changing POST requests
3. Implement account lockout after repeated failed logins
4. Add email verification on registration
5. Enable audit logging for sensitive operations
6. Run Aikido Security scan and address findings
7. Implement Content-Security-Policy nonce for inline scripts
8. Add request size limits at reverse proxy level
9. Use encrypted session tokens (JWE) instead of plain database IDs
10. Implement IP-based anomaly detection
