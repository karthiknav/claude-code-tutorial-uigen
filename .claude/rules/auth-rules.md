---
globs: src/lib/auth.ts, src/components/auth/**/*.tsx, src/actions/**/*.ts
---

# Auth Rules

- `src/lib/auth.ts` is marked `"server-only"` — never import it from client components or any file without a server context.
- Sessions are JWT tokens stored in an httpOnly cookie named `auth-token`. Do not read or set this cookie manually — use `createSession()`, `getSession()`, and `deleteSession()`.
- Always treat `getSession()` returning `null` as unauthenticated. Do not assume a session exists.
- `Project.userId` is optional (`String?`) — anonymous users can have projects. Never require a userId to exist before creating a project.
- Passwords must be hashed before storage. Never store or log plaintext passwords.
- `JWT_SECRET` falls back to a hardcoded dev string. In any environment beyond local dev, set it via the `JWT_SECRET` environment variable.
- Auth UI components in `src/components/auth/` are client components — they handle form state and call server actions. Keep server logic out of them.
