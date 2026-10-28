import type { Verdict } from "../../shared/types.js";

export const SCAM_THRESHOLD = 70;
export const SUSPICIOUS_THRESHOLD = 35;

const RULE_WEIGHT = 0.4;
const AI_WEIGHT = 0.6;

export interface ScoreInput {
  ruleScore: number;
  /** Undefined when the AI was unavailable; the rule score is then used alone. */
  aiScore?: number | undefined;
  hasHighSeverity: boolean;
}

export interface ScoreResult {
  riskScore: number;
  verdict: Verdict;
}

export function verdictFromScore(score: number): Verdict {
  if (score >= SCAM_THRESHOLD) return "scam";
  if (score >= SUSPICIOUS_THRESHOLD) return "suspicious";
  return "safe";
}

export function mergeScores({ ruleScore, aiScore, hasHighSeverity }: ScoreInput): ScoreResult {
  const merged =
    aiScore === undefined
      ? clampScore(ruleScore)
      : Math.round(RULE_WEIGHT * clampScore(ruleScore) + AI_WEIGHT * clampScore(aiScore));
  // A high-severity signal (OTP request, remote access, safe account, digital arrest) can never be
  // shown as "safe", whatever the AI says. Raise the score too so the meter matches the verdict.
  const riskScore = hasHighSeverity ? Math.max(merged, SUSPICIOUS_THRESHOLD) : merged;
  return { riskScore, verdict: verdictFromScore(riskScore) };
}

function clampScore(score: number): number {
  if (!Number.isFinite(score)) return 0;
  return Math.min(100, Math.max(0, score));
}
