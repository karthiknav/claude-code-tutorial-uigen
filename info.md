# Claude Code & SDK - Q&A

## Q: What is the difference between Claude Code CLI and Claude SDK?

**Claude Code CLI** is a developer tool you run in your terminal (`claude`) — it's an AI coding assistant that reads your files, edits code, runs commands, and helps you build software interactively.

**Claude SDK** (Anthropic SDK) is a programming library (`@anthropic-ai/sdk` for JS, `anthropic` for Python) that lets you call Claude's API from your own code — you write programs that send messages to Claude and process the responses programmatically.

In short:
- **CLI** = a tool you use as a developer
- **SDK** = a library you use to build apps that use Claude

They're related in that Claude Code CLI is itself built using the Claude API (which the SDK wraps), but they serve different purposes.

---

## Q: What is the difference between SDK and API?

**API** (Application Programming Interface) is the raw interface — a set of HTTP endpoints you call directly with requests.

**SDK** (Software Development Kit) is a library that wraps the API, handling the low-level details for you in a specific language.

### Example: Calling Claude

**Using the raw API directly (no SDK):**
```bash
curl https://api.anthropic.com/v1/messages \
  -H "x-api-key: $API_KEY" \
  -H "anthropic-version: 2023-06-01" \
  -H "content-type: application/json" \
  -d '{"model": "claude-sonnet-4-6", "max_tokens": 100, "messages": [{"role": "user", "content": "Hello"}]}'
```

**Using the SDK (same thing, but easier):**
```python
import anthropic

client = anthropic.Anthropic(api_key="...")
message = client.messages.create(
    model="claude-sonnet-4-6",
    max_tokens=100,
    messages=[{"role": "user", "content": "Hello"}]
)
```

The SDK handles things like:
- Setting the right headers automatically
- Parsing JSON responses into typed objects
- Retrying on rate limits
- Streaming responses

So: **API = the contract**, **SDK = the convenient wrapper** around that contract in your language of choice.

---

## Q: What is the difference between skills, commands, subagents and hooks?

These are four different extension mechanisms in Claude Code, each operating at a different level:

### Skills (Slash Commands via SDK)
Pre-built behaviors invoked with `/skill-name`. They run as **prompt instructions** that guide Claude's behavior for a specific task. Examples: `/review`, `/audit`, `/write-tests`. Skills are defined externally and loaded into the session — Claude executes them by following their instructions, not by running a separate process.

### Commands (Custom Slash Commands)
User-defined `/command-name` shortcuts stored as markdown files in `.claude/commands/`. When invoked, the file's content becomes a prompt. They're essentially **reusable prompt templates** — simpler and more personal than skills, and you write them yourself.

### Subagents
Separate Claude instances spawned mid-conversation via the `Agent` tool. They run **in isolation** (no shared context with the parent), do their work, and return a single result. Used for parallelizing independent tasks, protecting the main context window from large search results, or specialized roles (like the `Explore` or `Plan` agents). They start cold each time.

### Hooks
**Shell commands** that the harness (not Claude) executes automatically in response to events — e.g., before a tool runs, after Claude stops, when a file is saved. Configured in `settings.json`. Hooks are external to Claude entirely; they can block tool calls, inject feedback, or trigger side effects. Claude cannot fulfill "always do X" behaviors through memory — those require hooks.

### Summary

| | Who runs it | When | Defined where |
|---|---|---|---|
| **Skills** | Claude (follows instructions) | On `/invoke` | External SDK |
| **Commands** | Claude (follows prompt) | On `/invoke` | `.claude/commands/*.md` |
| **Subagents** | Separate Claude instance | Spawned by Claude mid-task | Via `Agent` tool |
| **Hooks** | The harness (shell) | On events (tool call, stop, etc.) | `settings.json` |

---
