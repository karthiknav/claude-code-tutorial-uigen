// @vitest-environment node — ReadableStream must use the Node built-in, not jsdom's shim
import { describe, it, expect, vi, beforeEach } from "vitest";

vi.mock("@ai-sdk/anthropic", () => ({
  anthropic: vi.fn(() => ({ type: "real-model" })),
}));

import { MockLanguageModel, getLanguageModel } from "@/lib/provider";

const MOCK_MODEL_ID = "mock-model";

function makeMessages(toolResultCount: number): any[] {
  const msgs: any[] = [{ role: "user", content: "build a button" }];
  for (let i = 0; i < toolResultCount; i++) {
    msgs.push({ role: "tool", content: `result ${i}` });
  }
  return msgs;
}

async function drainStream(stream: ReadableStream): Promise<any[]> {
  const reader = stream.getReader();
  const chunks: any[] = [];
  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    chunks.push(value);
  }
  return chunks;
}

describe("MockLanguageModel", () => {
  it("has correct provider and modelId", () => {
    const model = new MockLanguageModel(MOCK_MODEL_ID);
    expect(model.provider).toBe("mock");
    expect(model.modelId).toBe(MOCK_MODEL_ID);
  });

  it("doGenerate step 0: returns str_replace_editor tool call creating App.jsx", async () => {
    const model = new MockLanguageModel(MOCK_MODEL_ID);
    const result = await model.doGenerate({ prompt: makeMessages(0) } as any);
    expect(result.toolCalls).not.toHaveLength(0);
    const toolCall = result.toolCalls![0];
    expect(toolCall.toolName).toBe("str_replace_editor");
    const args = JSON.parse(toolCall.args as string);
    expect(args.command).toBe("create");
    expect(args.path).toBe("/App.jsx");
  }, 15000);

  it("doGenerate step 1: returns str_replace_editor tool call creating component file", async () => {
    const model = new MockLanguageModel(MOCK_MODEL_ID);
    const result = await model.doGenerate({ prompt: makeMessages(1) } as any);
    expect(result.toolCalls).not.toHaveLength(0);
    const toolCall = result.toolCalls![0];
    expect(toolCall.toolName).toBe("str_replace_editor");
    const args = JSON.parse(toolCall.args as string);
    expect(args.command).toBe("create");
    expect(args.path).toMatch(/\/components\//);
  }, 15000);

  it("doGenerate step 2: returns str_replace_editor tool call with str_replace command", async () => {
    const model = new MockLanguageModel(MOCK_MODEL_ID);
    const result = await model.doGenerate({ prompt: makeMessages(2) } as any);
    expect(result.toolCalls).not.toHaveLength(0);
    const toolCall = result.toolCalls![0];
    expect(toolCall.toolName).toBe("str_replace_editor");
    const args = JSON.parse(toolCall.args as string);
    expect(args.command).toBe("str_replace");
  }, 15000);

  it("doGenerate step 3+: returns text only with no tool calls and finishReason stop", async () => {
    const model = new MockLanguageModel(MOCK_MODEL_ID);
    const result = await model.doGenerate({ prompt: makeMessages(3) } as any);
    expect(result.toolCalls).toHaveLength(0);
    expect(result.text).toBeTruthy();
    expect(result.finishReason).toBe("stop");
  }, 20000);

  it("doGenerate returns usage and rawCall", async () => {
    const model = new MockLanguageModel(MOCK_MODEL_ID);
    const result = await model.doGenerate({ prompt: makeMessages(0) } as any);
    expect(result.usage.promptTokens).toBeGreaterThan(0);
    expect(result.usage.completionTokens).toBeGreaterThan(0);
    expect(result.rawCall.rawPrompt).toBeDefined();
  }, 15000);

  it("doStream returns a ReadableStream", async () => {
    const model = new MockLanguageModel(MOCK_MODEL_ID);
    const result = await model.doStream({ prompt: makeMessages(0) } as any);
    expect(result.stream).toBeInstanceOf(ReadableStream);
  });

  it("doStream step 0: emits text-delta chunks, a tool-call chunk, and a finish chunk", async () => {
    const model = new MockLanguageModel(MOCK_MODEL_ID);
    const { stream } = await model.doStream({ prompt: makeMessages(0) } as any);
    const chunks = await drainStream(stream);
    expect(chunks.length).toBeGreaterThan(0);
    const toolCallChunk = chunks.find((c) => c.type === "tool-call");
    expect(toolCallChunk).toBeDefined();
    expect(toolCallChunk.toolName).toBe("str_replace_editor");
    const finishChunk = chunks.find((c) => c.type === "finish");
    expect(finishChunk).toBeDefined();
  }, 15000);

  it("doStream step 3+: emits no tool-call chunks and finishes with reason stop", async () => {
    const model = new MockLanguageModel(MOCK_MODEL_ID);
    const { stream } = await model.doStream({ prompt: makeMessages(3) } as any);
    const chunks = await drainStream(stream);
    expect(chunks.filter((c) => c.type === "tool-call")).toHaveLength(0);
    const finishChunk = chunks.find((c) => c.type === "finish");
    expect(finishChunk?.finishReason).toBe("stop");
  }, 20000);
});

describe("getLanguageModel", () => {
  beforeEach(() => {
    vi.unstubAllEnvs();
  });

  it("returns MockLanguageModel when ANTHROPIC_API_KEY is not set", () => {
    vi.stubEnv("ANTHROPIC_API_KEY", "");
    expect(getLanguageModel()).toBeInstanceOf(MockLanguageModel);
  });

  it("returns MockLanguageModel when ANTHROPIC_API_KEY is the placeholder value", () => {
    vi.stubEnv("ANTHROPIC_API_KEY", "your-api-key-here");
    expect(getLanguageModel()).toBeInstanceOf(MockLanguageModel);
  });

  it("returns a non-mock model when ANTHROPIC_API_KEY is set to a real key", () => {
    vi.stubEnv("ANTHROPIC_API_KEY", "sk-ant-real-key-12345");
    expect(getLanguageModel()).not.toBeInstanceOf(MockLanguageModel);
  });

  it("MockLanguageModel returned by getLanguageModel has modelId starting with mock-", () => {
    vi.stubEnv("ANTHROPIC_API_KEY", "");
    const model = getLanguageModel() as MockLanguageModel;
    expect(model.modelId).toMatch(/^mock-/);
  });
});
