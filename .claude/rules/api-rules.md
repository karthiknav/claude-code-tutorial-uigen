---
globs: src/app/api/**/*.ts
---

# API Route Rules

- Use `getSession()` from `@/lib/auth` to authenticate before any user-scoped operation — never trust client-supplied user IDs.
- Return errors as plain `Response` or `NextResponse` with a meaningful HTTP status. Never expose stack traces or internal error messages to the client.
- All AI streaming routes must use `streamText` from the Vercel AI SDK and return `result.toDataStreamResponse()`.
- Set `export const maxDuration = 120` on routes that call the Anthropic API — the default Vercel timeout is too short for multi-step generation.
- Get the language model via `getLanguageModel()` from `@/lib/provider` — never instantiate `anthropic()` directly in a route handler.
- The system prompt must be the first message in the array and must include `cacheControl: { type: "ephemeral" }` in `providerOptions.anthropic`.
- AI tools (`str_replace_editor`, `file_manager`) operate on `VirtualFileSystem` only. Never read or write real files from a route handler.
- Parse the request body with explicit destructuring and type annotation — do not pass `req.json()` raw to downstream functions.
