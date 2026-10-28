import path from "node:path";
import compression from "compression";
import express, { type ErrorRequestHandler, type Express, type RequestHandler } from "express";
import { rateLimit } from "express-rate-limit";
import helmet from "helmet";
import type { AiAnalyzer } from "./ai/gemini.js";
import { createAnalyzeRouter } from "./routes/analyze.js";

export interface AppOptions {
  /** Directory holding the built Vite app. Defaults to dist/web under the working directory. */
  staticDir?: string;
  /** Gemini analyzer; null runs the rule engine only. */
  analyzer?: AiAnalyzer | null;
  /** Requests per minute per IP on /api. */
  rateLimitPerMinute?: number;
}

// A 4 MB image is ~5.4 MB as base64, plus the text and JSON overhead.
const JSON_BODY_LIMIT = "6mb";
const DEFAULT_RATE_LIMIT_PER_MINUTE = 20;
const ONE_YEAR_MS = 365 * 24 * 60 * 60 * 1000;

/** Strict CSP: only our own scripts and styles, no inline code, images only from us or local blobs. */
const securityHeaders = helmet({
  contentSecurityPolicy: {
    useDefaults: false,
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'"],
      styleSrc: ["'self'"],
      imgSrc: ["'self'", "data:", "blob:"],
      connectSrc: ["'self'"],
      fontSrc: ["'self'"],
      objectSrc: ["'none'"],
      baseUri: ["'self'"],
      formAction: ["'self'"],
      frameAncestors: ["'none'"],
      upgradeInsecureRequests: [],
    },
  },
  referrerPolicy: { policy: "no-referrer" },
});

const permissionsPolicy: RequestHandler = (_req, res, next) => {
  res.setHeader("Permissions-Policy", "camera=(), microphone=(), geolocation=(), payment=()");
  next();
};

export function createApp(options: AppOptions = {}): Express {
  const staticDir = options.staticDir ?? path.resolve("dist/web");
  const app = express();

  app.disable("x-powered-by");
  // The app runs behind one proxy hop (Cloud Run / Render); needed so rate limiting sees the client IP.
  app.set("trust proxy", 1);
  app.use(securityHeaders, permissionsPolicy, compression());

  app.get("/healthz", (_req, res) => {
    res.json({ ok: true });
  });

  app.use(
    "/api",
    rateLimit({
      windowMs: 60_000,
      limit: options.rateLimitPerMinute ?? DEFAULT_RATE_LIMIT_PER_MINUTE,
      standardHeaders: "draft-8",
      legacyHeaders: false,
      message: { error: "Too many requests. Please wait a minute and try again." },
    }),
    express.json({ limit: JSON_BODY_LIMIT }),
    createAnalyzeRouter({ analyzer: options.analyzer ?? null }),
  );
  app.use("/api", (_req, res) => {
    res.status(404).json({ error: "Not found" });
  });

  // Vite emits content-hashed filenames under /assets, so they can be cached forever.
  app.use(
    "/assets",
    express.static(path.join(staticDir, "assets"), {
      immutable: true,
      maxAge: ONE_YEAR_MS,
      index: false,
      fallthrough: false,
    }),
  );
  app.use(
    express.static(staticDir, {
      setHeaders: (res, filePath) => {
        if (filePath.endsWith(".html")) res.setHeader("Cache-Control", "no-cache");
      },
    }),
  );

  app.use(errorHandler);
  return app;
}

/** Central error handler: log the error type only, never request content, and return a generic message. */
const errorHandler: ErrorRequestHandler = (err: unknown, _req, res, next) => {
  if (res.headersSent) {
    next(err);
    return;
  }
  const status = getHttpStatus(err);
  if (status >= 500) console.error("Unhandled error:", err instanceof Error ? err.name : "unknown");
  res.status(status).json({ error: status >= 500 ? "Something went wrong" : "Request failed" });
};

function getHttpStatus(err: unknown): number {
  if (typeof err === "object" && err !== null && "status" in err) {
    const { status } = err;
    if (typeof status === "number" && status >= 400 && status < 600) return status;
  }
  return 500;
}
