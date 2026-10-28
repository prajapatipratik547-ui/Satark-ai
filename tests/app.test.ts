import { mkdtempSync, mkdirSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import request from "supertest";
import { describe, expect, it } from "vitest";
import { createApp } from "../src/server/app.js";

function makeStaticDir(): string {
  const dir = mkdtempSync(path.join(tmpdir(), "satark-web-"));
  mkdirSync(path.join(dir, "assets"));
  writeFileSync(path.join(dir, "index.html"), "<!doctype html><title>Satark</title>");
  writeFileSync(path.join(dir, "assets", "main-abc123.js"), "console.log(1)");
  return dir;
}

describe("app", () => {
  const app = createApp({ staticDir: makeStaticDir() });

  it("GET /healthz returns ok", async () => {
    const res = await request(app).get("/healthz");
    expect(res.status).toBe(200);
    expect(res.body).toEqual({ ok: true });
  });

  it("serves index.html with no-cache", async () => {
    const res = await request(app).get("/");
    expect(res.status).toBe(200);
    expect(res.headers["cache-control"]).toBe("no-cache");
  });

  it("serves hashed assets with a long immutable cache", async () => {
    const res = await request(app).get("/assets/main-abc123.js");
    expect(res.status).toBe(200);
    expect(res.headers["cache-control"]).toContain("immutable");
  });

  it("returns JSON 404 for unknown API routes", async () => {
    const res = await request(app).get("/api/nope");
    expect(res.status).toBe(404);
    expect(res.body).toEqual({ error: "Not found" });
  });

  it("does not advertise Express", async () => {
    const res = await request(app).get("/healthz");
    expect(res.headers["x-powered-by"]).toBeUndefined();
  });
});
