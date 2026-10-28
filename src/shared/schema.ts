import { z } from "zod";
import { LANGUAGE_CODES } from "./languages.js";
import { IMAGE_MIME_TYPES, MAX_IMAGE_BYTES, MAX_TEXT_LENGTH } from "./limits.js";

export {
  IMAGE_MIME_TYPES,
  MAX_IMAGE_BYTES,
  MAX_TEXT_LENGTH,
  type ImageMimeType,
} from "./limits.js";

const BASE64_PATTERN = /^[A-Za-z0-9+/]+={0,2}$/;
// Base64 needs 4 characters per 3 bytes.
const MAX_IMAGE_BASE64_LENGTH = Math.ceil(MAX_IMAGE_BYTES / 3) * 4;

export function decodedBase64Size(base64: string): number {
  const padding = base64.endsWith("==") ? 2 : base64.endsWith("=") ? 1 : 0;
  return Math.floor((base64.length * 3) / 4) - padding;
}

export const AnalyzeRequestSchema = z
  .strictObject({
    text: z.string().trim().max(MAX_TEXT_LENGTH).optional(),
    imageBase64: z
      .string()
      .max(MAX_IMAGE_BASE64_LENGTH, "Image is larger than 4 MB")
      .regex(BASE64_PATTERN, "Image must be base64 encoded")
      .optional(),
    imageMimeType: z.enum(IMAGE_MIME_TYPES).optional(),
    language: z.enum(LANGUAGE_CODES),
  })
  .refine((body) => Boolean(body.text) || Boolean(body.imageBase64), {
    message: "Provide the message text or a screenshot",
  })
  .refine((body) => !body.imageBase64 || body.imageMimeType !== undefined, {
    message: "imageMimeType is required with an image",
    path: ["imageMimeType"],
  })
  .refine((body) => !body.imageBase64 || decodedBase64Size(body.imageBase64) <= MAX_IMAGE_BYTES, {
    message: "Image is larger than 4 MB",
    path: ["imageBase64"],
  });

export type AnalyzeRequest = z.infer<typeof AnalyzeRequestSchema>;

/** What Gemini must return. Everything here is untrusted until validated and sanitised. */
export const AiAnalysisSchema = z.object({
  riskScore: z.number().min(0).max(100),
  scamType: z.string().max(80),
  summary: z.string().max(800),
  redFlags: z.array(z.object({ phrase: z.string().max(300), reason: z.string().max(300) })).max(10),
  extractedText: z.string().max(8000).optional(),
});

export type AiAnalysis = z.infer<typeof AiAnalysisSchema>;

export const AnalysisResultSchema = z.object({
  verdict: z.enum(["scam", "suspicious", "safe"]),
  riskScore: z.number().int().min(0).max(100),
  scamType: z.string(),
  summary: z.string(),
  redFlags: z.array(
    z.object({ phrase: z.string(), reason: z.string(), source: z.enum(["rules", "ai"]) }),
  ),
  actions: z.array(z.string()),
  extractedText: z.string().optional(),
  aiUsed: z.boolean(),
  language: z.enum(LANGUAGE_CODES),
});
