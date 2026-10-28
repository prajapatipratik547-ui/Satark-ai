import request from "supertest";
import { describe, expect, it } from "vitest";
import { createApp } from "../src/server/app.js";

describe("security headers", () => {
  const app = createApp({ staticDir: "nonexistent" });

  it("sends a strict Content Security Policy", async () => {
    const res = await request(app).get("/healthz");
    const csp = String(res.headers["content-security-policy"]);
    expect(csp).toContain("default-src 'self'");
    expect(csp).toContain("script-src 'self'");
    expect(csp).toContain("img-src 'self' data: blob:");
    expect(csp).toContain("frame-ancestors 'none'");
    expect(csp).toContain("object-src 'none'");
    expect(csp).not.toContain("unsafe-inline");
    expect(csp).not.toContain("unsafe-eval");
  });

  it("sets the other hardening headers", async () => {
    const res = await request(app).get("/healthz");
    expect(res.headers["x-content-type-options"]).toBe("nosniff");
    expect(res.headers["referrer-policy"]).toBe("no-referrer");
    expect(res.headers["strict-transport-security"]).toBeDefined();
    expect(res.headers["permissions-policy"]).toContain("camera=()");
  });
});

describe("rate limiting", () => {
  it("limits /api requests per IP and answers 429 with a plain message", async () => {
    const app = createApp({ staticDir: "nonexistent", rateLimitPerMinute: 3 });
    const send = () => request(app).post("/api/analyze").send({ text: "hello", language: "en" });
    for (let i = 0; i < 3; i += 1) expect((await send()).status).toBe(200);
    const limited = await send();
    expect(limited.status).toBe(429);
    expect(limited.body).toEqual({
      error: "Too many requests. Please wait a minute and try again.",
    });
  });

  it("does not rate-limit the health check", async () => {
    const app = createApp({ staticDir: "nonexistent", rateLimitPerMinute: 1 });
    for (let i = 0; i < 3; i += 1) expect((await request(app).get("/healthz")).status).toBe(200);
  });
});

describe("error handling", () => {
  it("never leaks a stack trace", async () => {
    const res = await request(createApp({ staticDir: "nonexistent" }))
      .post("/api/analyze")
      .set("Content-Type", "application/json")
      .send('{"text": ');
    expect(res.status).toBe(400);
    expect(res.text).not.toMatch(/SyntaxError|node_modules|at \w+ \(/);
  });
});
