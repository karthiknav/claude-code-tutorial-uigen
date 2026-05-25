import { vi, beforeEach, describe, it, expect } from "vitest";
import { buildFileManagerTool } from "@/lib/tools/file-manager";

const mockFs = {
  rename: vi.fn(),
  deleteFile: vi.fn(),
  viewFile: vi.fn(),
  createFileWithParents: vi.fn(),
  replaceInFile: vi.fn(),
  insertInFile: vi.fn(),
} as any;

beforeEach(() => {
  vi.clearAllMocks();
  mockFs.rename.mockReturnValue(true);
  mockFs.deleteFile.mockReturnValue(true);
  mockFs.viewFile.mockReturnValue("line 1\nline 2");
  mockFs.createFileWithParents.mockReturnValue("File created successfully");
  mockFs.replaceInFile.mockReturnValue("Replaced 1 occurrence");
  mockFs.insertInFile.mockReturnValue("Inserted successfully");
});

describe("buildFileManagerTool", () => {
  it("rename success: calls fs.rename and returns success true", async () => {
    const tool = buildFileManagerTool(mockFs);
    const result = await tool.execute(
      { command: "rename", path: "/old.js", new_path: "/new.js" },
      { messages: [], toolCallId: "t1" }
    );

    expect(mockFs.rename).toHaveBeenCalledWith("/old.js", "/new.js");
    expect(result).toMatchObject({ success: true });
  });

  it("rename failure: returns success false and error when fs.rename returns false", async () => {
    mockFs.rename.mockReturnValue(false);
    const tool = buildFileManagerTool(mockFs);
    const result = await tool.execute(
      { command: "rename", path: "/old.js", new_path: "/new.js" },
      { messages: [], toolCallId: "t1" }
    );

    expect(result).toMatchObject({ success: false });
    expect((result as any).error).toBeDefined();
  });

  it("rename missing new_path: returns success false", async () => {
    const tool = buildFileManagerTool(mockFs);
    const result = await tool.execute(
      { command: "rename", path: "/old.js" },
      { messages: [], toolCallId: "t1" }
    );

    expect(result).toMatchObject({ success: false });
  });

  it("delete success: calls fs.deleteFile and returns success true", async () => {
    const tool = buildFileManagerTool(mockFs);
    const result = await tool.execute(
      { command: "delete", path: "/test.js" },
      { messages: [], toolCallId: "t1" }
    );

    expect(mockFs.deleteFile).toHaveBeenCalledWith("/test.js");
    expect(result).toMatchObject({ success: true });
  });

  it("delete failure: returns success false when fs.deleteFile returns false", async () => {
    mockFs.deleteFile.mockReturnValue(false);
    const tool = buildFileManagerTool(mockFs);
    const result = await tool.execute(
      { command: "delete", path: "/test.js" },
      { messages: [], toolCallId: "t1" }
    );

    expect(result).toMatchObject({ success: false });
  });
});
