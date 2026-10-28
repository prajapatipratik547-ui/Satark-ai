import type { LanguageCode } from "../../shared/languages.js";
import type { ImageMimeType } from "../../shared/limits.js";
import type { AnalysisResult } from "../../shared/types.js";

export interface AnalyzeBody {
  text?: string;
  imageBase64?: string;
  imageMimeType?: ImageMimeType;
  language: LanguageCode;
}

export type ApiErrorKind = "rateLimit" | "image" | "generic";

export class ApiError extends Error {
  constructor(readonly kind: ApiErrorKind) {
    super(kind);
    this.name = "ApiError";
  }
}

export async function analyzeMessage(
  body: AnalyzeBody,
  signal?: AbortSignal,
): Promise<AnalysisResult> {
  let response: Response;
  try {
    response = await fetch("/api/analyze", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
      signal: signal ?? null,
    });
  } catch (error) {
    if (error instanceof DOMException && error.name === "AbortError") throw error;
    throw new ApiError("generic");
  }
  if (response.status === 429) throw new ApiError("rateLimit");
  if (response.status === 422) throw new ApiError("image");
  if (!response.ok) throw new ApiError("generic");
  return (await response.json()) as AnalysisResult;
}
