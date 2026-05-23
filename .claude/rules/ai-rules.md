---
globs: src/lib/provider.ts, src/lib/tools/**/*.ts, src/lib/prompts/**/*.{ts,tsx}
---

# AI / LLM Rules

- Always use `getLanguageModel()` from `@/lib/provider` to obtain the model. When `ANTHROPIC_API_KEY` is absent or is the placeholder `"your-api-key-here"`, this returns `MockLanguageModel` automatically — do not add duplicate checks elsewhere.
- The current model is `claude-haiku-4-5`. To change the model, update the `MODEL` constant in `provider.ts` only.
- `maxSteps` must be 40 for the real provider and 4 for mock. Increasing the mock limit causes repetitive canned output.
- The system prompt in `src/lib/prompts/generation.tsx` must remain the first message and must include `providerOptions.anthropic.cacheControl: { type: "ephemeral" }` to enable prompt caching.
- Tools built in `src/lib/tools/` must accept a `VirtualFileSystem` instance and operate on it exclusively — no real filesystem access (`fs`, `path`, etc.).
- Tool schemas should use Zod for parameter validation via the Vercel AI SDK `tool()` helper.
- `MockLanguageModel` implements `LanguageModelV1` — any new mock behavior must satisfy the full interface (both `doGenerate` and `doStream`).
