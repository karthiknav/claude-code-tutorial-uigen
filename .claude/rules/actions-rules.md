---
globs: src/actions/**/*.ts
---

# Server Action Rules

- Every action that touches user-owned data must call `getSession()` from `@/lib/auth` and return early (or throw) if no session exists.
- Use the Prisma singleton from `@/lib/prisma` — never instantiate `PrismaClient` inside an action.
- `Project.messages` and `Project.data` are stored as JSON strings in SQLite. Always `JSON.stringify()` before writing and `JSON.parse()` after reading — Prisma does not do this automatically.
- Actions must be async and marked with `"use server"` if called from client components.
- Do not return raw Prisma model objects to the client — select only the fields needed.
- Keep actions focused: one action per operation (create, get, update, delete). Do not combine unrelated DB calls into one action.
