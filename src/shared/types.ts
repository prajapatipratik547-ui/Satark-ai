import type { LanguageCode } from "./languages.js";

export type Verdict = "scam" | "suspicious" | "safe";

export type RedFlagSource = "rules" | "ai";

export interface RedFlag {
  phrase: string;
  reason: string;
  source: RedFlagSource;
}

export interface AnalysisResult {
  verdict: Verdict;
  /** 0–100, final merged score. */
  riskScore: number;
  scamType: string;
  summary: string;
  redFlags: RedFlag[];
  actions: string[];
  extractedText?: string;
  /** False when the AI was unavailable and the result comes from rules only. */
  aiUsed: boolean;
  language: LanguageCode;
}
