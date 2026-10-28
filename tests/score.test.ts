import { describe, expect, it } from "vitest";
import {
  SCAM_THRESHOLD,
  SUSPICIOUS_THRESHOLD,
  mergeScores,
  verdictFromScore,
} from "../src/server/engine/score.js";

describe("verdictFromScore boundaries", () => {
  it.each([
    [0, "safe"],
    [34, "safe"],
    [35, "suspicious"],
    [69, "suspicious"],
    [70, "scam"],
    [100, "scam"],
  ] as const)("%i → %s", (score, verdict) => {
    expect(verdictFromScore(score)).toBe(verdict);
  });

  it("uses the documented thresholds", () => {
    expect(SCAM_THRESHOLD).toBe(70);
    expect(SUSPICIOUS_THRESHOLD).toBe(35);
  });
});

describe("mergeScores", () => {
  it("uses the rule score alone when the AI is unavailable", () => {
    expect(mergeScores({ ruleScore: 55, hasHighSeverity: false })).toEqual({
      riskScore: 55,
      verdict: "suspicious",
    });
  });

  it("weights rules 0.4 and AI 0.6", () => {
    expect(mergeScores({ ruleScore: 50, aiScore: 100, hasHighSeverity: false }).riskScore).toBe(80);
    expect(mergeScores({ ruleScore: 15, aiScore: 10, hasHighSeverity: false }).riskScore).toBe(12);
  });

  it("rounds the merged score", () => {
    // 0.4 * 33 + 0.6 * 34 = 33.6
    expect(mergeScores({ ruleScore: 33, aiScore: 34, hasHighSeverity: false }).riskScore).toBe(34);
  });

  it("never lets a high-severity rule hit be shown as safe, even if the AI says so", () => {
    const result = mergeScores({ ruleScore: 40, aiScore: 0, hasHighSeverity: true });
    expect(result.verdict).toBe("suspicious");
    expect(result.riskScore).toBe(SUSPICIOUS_THRESHOLD);
  });

  it("does not lower a score that is already above the floor", () => {
    expect(mergeScores({ ruleScore: 90, aiScore: 90, hasHighSeverity: true }).riskScore).toBe(90);
  });

  it("clamps out-of-range and non-numeric AI scores", () => {
    expect(mergeScores({ ruleScore: 0, aiScore: 500, hasHighSeverity: false }).riskScore).toBe(60);
    expect(
      mergeScores({ ruleScore: 50, aiScore: Number.NaN, hasHighSeverity: false }).riskScore,
    ).toBe(20);
  });
});
