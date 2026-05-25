import { vi, beforeEach, describe, it, expect } from "vitest";
import { buildStrReplaceTool } from "@/lib/tools/str-replace";

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

describe("buildStrReplaceTool", () => {
  it("view without range: calls fs.viewFile with undefined range", async () => {
    const tool = buildStrReplaceTool(mockFs);
    await tool.execute({ command: "view", path: "/test.txt" });

    expect(mockFs.viewFile).toHaveBeenCalledWith("/test.txt", undefined);
  });

  it("view with range: calls fs.viewFile with the provided range", async () => {
    const tool = buildStrReplaceTool(mockFs);
    await tool.execute({ command: "view", path: "/test.txt", view_range: [1, 10] });

    expect(mockFs.viewFile).toHaveBeenCalledWith("/test.txt", [1, 10]);
  });

  it("create with file_text: calls fs.createFileWithParents with path and content", async () => {
    const tool = buildStrReplaceTool(mockFs);
    await tool.execute({ command: "create", path: "/new.txt", file_text: "content" });

    expect(mockFs.createFileWithParents).toHaveBeenCalledWith("/new.txt", "content");
  });

  it("str_replace: calls fs.replaceInFile with path, old string, and new string", async () => {
    const tool = buildStrReplaceTool(mockFs);
    await tool.execute({
      command: "str_replace",
      path: "/test.txt",
      old_str: "old",
      new_str: "new",
    });

    expect(mockFs.replaceInFile).toHaveBeenCalledWith("/test.txt", "old", "new");
  });

  it("insert: calls fs.insertInFile with path, line number, and new string", async () => {
    const tool = buildStrReplaceTool(mockFs);
    await tool.execute({
      command: "insert",
      path: "/test.txt",
      insert_line: 5,
      new_str: "new line",
    });

    expect(mockFs.insertInFile).toHaveBeenCalledWith("/test.txt", 5, "new line");
  });

  it("undo_edit: returns error message containing 'not supported' without calling any FS method", async () => {
    const tool = buildStrReplaceTool(mockFs);
    const result = await tool.execute({ command: "undo_edit", path: "/test.txt" });

    expect(result).toMatch(/not supported/i);
    expect(mockFs.viewFile).not.toHaveBeenCalled();
    expect(mockFs.createFileWithParents).not.toHaveBeenCalled();
    expect(mockFs.replaceInFile).not.toHaveBeenCalled();
    expect(mockFs.insertInFile).not.toHaveBeenCalled();
    expect(mockFs.rename).not.toHaveBeenCalled();
    expect(mockFs.deleteFile).not.toHaveBeenCalled();
  });
});
