import { describe, expect, it } from "vitest";
import { computeMetrics, loadFixtures, predictWithRules } from "../scripts/metrics.js";

describe("accuracy on labelled fixtures (rules only)", () => {
  const fixtures = loadFixtures();
  const rows = fixtures.map((fixture) => ({ fixture, prediction: predictWithRules(fixture.text) }));
  const metrics = computeMetrics(rows);

  it("has a balanced fixture set in English, Hindi and Hinglish", () => {
    expect(fixtures.filter((f) => f.label === "scam").length).toBeGreaterThanOrEqual(20);
    expect(fixtures.filter((f) => f.label === "genuine").length).toBeGreaterThanOrEqual(10);
    expect(new Set(fixtures.map((f) => f.lang))).toEqual(new Set(["en", "hi", "hinglish"]));
  });

  it("catches at least 80% of scams", () => {
    expect(metrics.recall).toBeGreaterThanOrEqual(0.8);
  });

  it("never gives a genuine message the 'scam' verdict", () => {
    expect(metrics.genuineMarkedScam).toBe(0);
  });
});

describe("computeMetrics", () => {
  it("computes precision and recall from verdicts", () => {
    const fixture = (label: "scam" | "genuine") => ({
      id: label,
      label,
      lang: "en" as const,
      category: "x",
      text: "x",
    });
    const metrics = computeMetrics([
      { fixture: fixture("scam"), prediction: { verdict: "scam", riskScore: 90, scamType: "" } },
      { fixture: fixture("scam"), prediction: { verdict: "safe", riskScore: 10, scamType: "" } },
      {
        fixture: fixture("genuine"),
        prediction: { verdict: "suspicious", riskScore: 40, scamType: "" },
      },
      { fixture: fixture("genuine"), prediction: { verdict: "safe", riskScore: 0, scamType: "" } },
    ]);
    expect(metrics.recall).toBe(0.5);
    expect(metrics.precision).toBe(0.5);
    expect(metrics.accuracy).toBe(0.5);
    expect(metrics.misses).toHaveLength(2);
  });
});
