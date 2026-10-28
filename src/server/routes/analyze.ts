import { Router } from "express";
import { AnalyzeRequestSchema } from "../../shared/schema.js";
import type { AnalysisResult } from "../../shared/types.js";
import type { AiAnalyzer } from "../ai/gemini.js";
import { ScreenshotUnreadableError, analyzeMessage } from "../analyze.js";
import { LruCache, hashKey } from "../cache.js";

export interface AnalyzeRouteOptions {
  analyzer: AiAnalyzer | null;
  cache?: LruCache<AnalysisResult>;
}

export function createAnalyzeRouter({
  analyzer,
  cache = new LruCache<AnalysisResult>(),
}: AnalyzeRouteOptions): Router {
  const router = Router();

  router.post("/analyze", async (req, res) => {
    const parsed = AnalyzeRequestSchema.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({
        error: "Invalid request",
        issues: parsed.error.issues.map((issue) => ({
          path: issue.path.join("."),
          message: issue.message,
        })),
      });
      return;
    }

    const request = parsed.data;
    const key = hashKey(request.language, request.text, request.imageMimeType, request.imageBase64);
    const cached = cache.get(key);
    if (cached) {
      res.json(cached);
      return;
    }

    try {
      const result = await analyzeMessage(request, analyzer);
      // Only cache AI-backed results, so a temporary AI outage isn't remembered for an hour.
      if (result.aiUsed) cache.set(key, result);
      res.json(result);
    } catch (error) {
      if (error instanceof ScreenshotUnreadableError) {
        res.status(422).json({
          error:
            "We couldn't read this screenshot right now. Please paste the message text instead.",
        });
        return;
      }
      throw error;
    }
  });

  return router;
}
