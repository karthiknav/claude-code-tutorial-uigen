import { describe, it, expect, beforeEach } from "vitest";
import {
  setHasAnonWork,
  getHasAnonWork,
  getAnonWorkData,
  clearAnonWork,
} from "@/lib/anon-work-tracker";

beforeEach(() => {
  sessionStorage.clear();
});

describe("setHasAnonWork", () => {
  it("stores data when messages array is non-empty", () => {
    setHasAnonWork([{ role: "user", content: "hello" }], { "/": {} });
    expect(getHasAnonWork()).toBe(true);
  });

  it("stores data when fileSystemData has more than one key", () => {
    setHasAnonWork([], { "/": {}, "/App.jsx": { type: "file" } });
    expect(getHasAnonWork()).toBe(true);
  });

  it("does not store when messages are empty and fileSystemData has only root", () => {
    setHasAnonWork([], { "/": {} });
    expect(getHasAnonWork()).toBe(false);
  });
});

describe("getHasAnonWork", () => {
  it("returns false when nothing has been stored", () => {
    expect(getHasAnonWork()).toBe(false);
  });

  it("returns true after data has been stored", () => {
    setHasAnonWork([{ role: "user", content: "hi" }], {});
    expect(getHasAnonWork()).toBe(true);
  });
});

describe("getAnonWorkData", () => {
  it("returns null when nothing is stored", () => {
    expect(getAnonWorkData()).toBeNull();
  });

  it("returns the stored messages and fileSystemData", () => {
    const messages = [{ role: "user", content: "build me a button" }];
    const fsData = { "/App.jsx": { type: "file", content: "<App />" } };
    setHasAnonWork(messages, fsData);
    const result = getAnonWorkData();
    expect(result?.messages).toEqual(messages);
    expect(result?.fileSystemData).toEqual(fsData);
  });

  it("returns null when stored value is invalid JSON", () => {
    sessionStorage.setItem("uigen_anon_data", "not valid json{{");
    expect(getAnonWorkData()).toBeNull();
  });
});

describe("clearAnonWork", () => {
  it("removes both storage keys", () => {
    setHasAnonWork([{ role: "user", content: "hi" }], {});
    expect(getHasAnonWork()).toBe(true);
    clearAnonWork();
    expect(getHasAnonWork()).toBe(false);
    expect(getAnonWorkData()).toBeNull();
  });
});
