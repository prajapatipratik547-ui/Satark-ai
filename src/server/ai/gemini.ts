import { GoogleGenAI, Type, type Part, type Schema } from "@google/genai";
import { AiAnalysisSchema, type AiAnalysis, type ImageMimeType } from "../../shared/schema.js";
import type { LanguageCode } from "../../shared/languages.js";
import { buildSystemInstruction, buildUserPrompt, createBoundary } from "./prompt.js";

export interface AiInput {
  /** Redacted message text (may be empty for screenshot-only checks). */
  text: string;
  image?: { base64: string; mimeType: ImageMimeType } | undefined;
  language: LanguageCode;
}

/** Returns null whenever the AI is unavailable or its reply is unusable; callers fall back to rules. */
export type AiAnalyzer = (input: AiInput) => Promise<AiAnalysis | null>;

export interface GeminiOptions {
  apiKey: string;
  model: string;
  /** Per-attempt timeout. */
  timeoutMs?: number;
  /** Total time budget across the first attempt and the single retry. */
  budgetMs?: number;
}

const DEFAULT_TIMEOUT_MS = 12_000;
const DEFAULT_BUDGET_MS = 15_000;
const MIN_RETRY_WINDOW_MS = 3_000;

const RESPONSE_SCHEMA: Schema = {
  type: Type.OBJECT,
  properties: {
    riskScore: { type: Type.INTEGER, minimum: 0, maximum: 100 },
    scamType: { type: Type.STRING },
    summary: { type: Type.STRING },
    redFlags: {
      type: Type.ARRAY,
      maxItems: "6",
      items: {
        type: Type.OBJECT,
        properties: { phrase: { type: Type.STRING }, reason: { type: Type.STRING } },
        required: ["phrase", "reason"],
        propertyOrdering: ["phrase", "reason"],
      },
    },
    extractedText: { type: Type.STRING },
  },
  required: ["riskScore", "scamType", "summary", "redFlags", "extractedText"],
  propertyOrdering: ["extractedText", "riskScore", "scamType", "summary", "redFlags"],
};

export function parseAiResponse(raw: string | undefined): AiAnalysis | null {
  if (!raw) return null;
  let json: unknown;
  try {
    json = JSON.parse(raw);
  } catch {
    return null;
  }
  const parsed = AiAnalysisSchema.safeParse(json);
  return parsed.success ? parsed.data : null;
}

export function createGeminiAnalyzer(options: GeminiOptions): AiAnalyzer {
  const client = new GoogleGenAI({ apiKey: options.apiKey });
  const timeoutMs = options.timeoutMs ?? DEFAULT_TIMEOUT_MS;
  const budgetMs = options.budgetMs ?? DEFAULT_BUDGET_MS;

  async function callOnce(input: AiInput, attemptTimeoutMs: number): Promise<AiAnalysis | null> {
    const boundary = createBoundary();
    const parts: Part[] = [
      { text: buildUserPrompt({ ...input, hasImage: Boolean(input.image) }, boundary) },
    ];
    if (input.image) {
      parts.push({ inlineData: { data: input.image.base64, mimeType: input.image.mimeType } });
    }
    const controller = new AbortController();
    const timer = setTimeout(() => {
      controller.abort();
    }, attemptTimeoutMs);
    try {
      const response = await client.models.generateContent({
        model: options.model,
        contents: [{ role: "user", parts }],
        config: {
          systemInstruction: buildSystemInstruction(boundary),
          responseMimeType: "application/json",
          responseSchema: RESPONSE_SCHEMA,
          temperature: 0.2,
          maxOutputTokens: 2048,
          // Speed matters more than deep reasoning here; the rule engine backs it up.
          thinkingConfig: { thinkingBudget: 0 },
          abortSignal: controller.signal,
        },
      });
      return parseAiResponse(response.text);
    } finally {
      clearTimeout(timer);
    }
  }

  return async (input) => {
    const deadline = Date.now() + budgetMs;
    for (let attempt = 0; attempt < 2; attempt += 1) {
      const remaining = deadline - Date.now();
      if (attempt > 0 && remaining < MIN_RETRY_WINDOW_MS) break;
      try {
        const result = await callOnce(input, Math.min(timeoutMs, remaining));
        if (result) return result;
      } catch (error) {
        // Log only the error type, never message content or the key.
        console.warn(`Gemini attempt ${String(attempt + 1)} failed:`, describeError(error));
        if (isAbort(error)) break;
      }
    }
    return null;
  };
}

function isAbort(error: unknown): boolean {
  return error instanceof Error && error.name === "AbortError";
}

function describeError(error: unknown): string {
  if (!(error instanceof Error)) return "unknown error";
  const status = "status" in error ? ` (status ${String(error.status)})` : "";
  return `${error.name}${status}`;
}
