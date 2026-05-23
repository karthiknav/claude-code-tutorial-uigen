// @vitest-environment node
import { describe, it, expect, vi, beforeEach } from "vitest";

vi.mock("server-only", () => ({}));

const mockCookieSet = vi.fn();
const mockCookieGet = vi.fn();
const mockCookieDelete = vi.fn();

vi.mock("next/headers", () => ({
  cookies: vi.fn(() =>
    Promise.resolve({
      set: mockCookieSet,
      get: mockCookieGet,
      delete: mockCookieDelete,
    })
  ),
}));

import { createSession, getSession, deleteSession, verifySession } from "@/lib/auth";
import { NextRequest } from "next/server";
import { SignJWT } from "jose";

const JWT_SECRET = new TextEncoder().encode("development-secret-key");

async function makeToken(payload: object, expiresAt?: number) {
  const exp = expiresAt ?? Math.floor(Date.now() / 1000) + 7 * 24 * 60 * 60;
  return new SignJWT(payload as Record<string, unknown>)
    .setProtectedHeader({ alg: "HS256" })
    .setExpirationTime(exp)
    .setIssuedAt()
    .sign(JWT_SECRET);
}

async function makeExpiredToken(payload: object) {
  return makeToken(payload, Math.floor(Date.now() / 1000) - 10);
}

function makeRequest(token?: string) {
  const headers = new Headers();
  if (token) {
    headers.set("Cookie", `auth-token=${token}`);
  }
  return new NextRequest("http://localhost/", { headers });
}

beforeEach(() => {
  vi.clearAllMocks();
});

describe("createSession", () => {
  it("sets an httpOnly cookie with a JWT token", async () => {
    await createSession("user-1", "user@example.com");

    expect(mockCookieSet).toHaveBeenCalledOnce();
    const [name, _token, options] = mockCookieSet.mock.calls[0];
    expect(name).toBe("auth-token");
    expect(typeof _token).toBe("string");
    expect(_token.split(".")).toHaveLength(3);
    expect(options.httpOnly).toBe(true);
    expect(options.sameSite).toBe("lax");
    expect(options.path).toBe("/");
  });

  it("sets cookie expiry approximately 7 days from now", async () => {
    const before = Date.now();
    await createSession("user-1", "user@example.com");
    const after = Date.now();

    const [, , options] = mockCookieSet.mock.calls[0];
    const expiresMs = options.expires.getTime();
    const sevenDays = 7 * 24 * 60 * 60 * 1000;

    expect(expiresMs).toBeGreaterThanOrEqual(before + sevenDays - 1000);
    expect(expiresMs).toBeLessThanOrEqual(after + sevenDays + 1000);
  });

  it("stores userId and email so getSession can retrieve them", async () => {
    await createSession("user-42", "test@test.com");

    const [, token] = mockCookieSet.mock.calls[0];
    mockCookieGet.mockReturnValue({ value: token });

    const session = await getSession();
    expect(session?.userId).toBe("user-42");
    expect(session?.email).toBe("test@test.com");
  });
});

describe("getSession", () => {
  it("returns null when no cookie is present", async () => {
    mockCookieGet.mockReturnValue(undefined);

    const session = await getSession();
    expect(session).toBeNull();
  });

  it("returns the session payload for a valid token", async () => {
    const token = await makeToken({
      userId: "user-1",
      email: "user@example.com",
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    });
    mockCookieGet.mockReturnValue({ value: token });

    const session = await getSession();

    expect(session).not.toBeNull();
    expect(session?.userId).toBe("user-1");
    expect(session?.email).toBe("user@example.com");
  });

  it("returns null for a tampered token", async () => {
    const token = await makeToken({ userId: "user-1", email: "user@example.com" });
    const tampered = token.slice(0, -5) + "XXXXX";
    mockCookieGet.mockReturnValue({ value: tampered });

    const session = await getSession();
    expect(session).toBeNull();
  });

  it("returns null for an expired token", async () => {
    const token = await makeExpiredToken({ userId: "user-1", email: "user@example.com" });
    mockCookieGet.mockReturnValue({ value: token });

    const session = await getSession();
    expect(session).toBeNull();
  });

  it("returns null for a malformed token string", async () => {
    mockCookieGet.mockReturnValue({ value: "not.a.jwt" });

    const session = await getSession();
    expect(session).toBeNull();
  });

  it("returns null for an empty token string", async () => {
    mockCookieGet.mockReturnValue({ value: "" });

    const session = await getSession();
    expect(session).toBeNull();
  });
});

describe("deleteSession", () => {
  it("deletes the auth-token cookie", async () => {
    await deleteSession();

    expect(mockCookieDelete).toHaveBeenCalledOnce();
    expect(mockCookieDelete).toHaveBeenCalledWith("auth-token");
  });
});

describe("verifySession", () => {
  it("returns null when no cookie is on the request", async () => {
    const req = makeRequest();
    const session = await verifySession(req);
    expect(session).toBeNull();
  });

  it("returns the session payload for a valid token on the request", async () => {
    const token = await makeToken({
      userId: "user-2",
      email: "req@example.com",
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    });
    const req = makeRequest(token);

    const session = await verifySession(req);

    expect(session).not.toBeNull();
    expect(session?.userId).toBe("user-2");
    expect(session?.email).toBe("req@example.com");
  });

  it("returns null for a tampered token on the request", async () => {
    const token = await makeToken({ userId: "user-2", email: "req@example.com" });
    const tampered = token.slice(0, -5) + "XXXXX";
    const req = makeRequest(tampered);

    const session = await verifySession(req);
    expect(session).toBeNull();
  });

  it("returns null for an expired token on the request", async () => {
    const token = await makeExpiredToken({ userId: "user-2", email: "req@example.com" });
    const req = makeRequest(token);

    const session = await verifySession(req);
    expect(session).toBeNull();
  });

  it("returns null for a malformed token on the request", async () => {
    const req = makeRequest("garbage");

    const session = await verifySession(req);
    expect(session).toBeNull();
  });
});
