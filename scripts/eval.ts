/**
 * Accuracy evaluation on our labelled fixtures.
 *   npm run eval          rule engine only
 *   npm run eval -- --ai  full pipeline (rules + Gemini); needs GEMINI_API_KEY
 */
import { computeMetrics, loadFixtures, predictWithRules, type EvalRow } from "./metrics.js";

const useAi = process.argv.includes("--ai");

function percent(value: number): string {
  return `${(value * 100).toFixed(1)}%`;
}

function main(): void {
  if (useAi) {
    console.error(
      "--ai is not wired up yet (the Gemini pipeline lands in stage 3). Running rules only.",
    );
  }

  const rows: EvalRow[] = loadFixtures().map((fixture) => ({
    fixture,
    prediction: predictWithRules(fixture.text),
  }));
  const metrics = computeMetrics(rows);

  console.log("Satark evaluation — rule engine only\n");
  for (const { fixture, prediction } of rows) {
    const flagged = prediction.verdict !== "safe";
    const correct = flagged === (fixture.label === "scam");
    console.log(
      `${correct ? "ok  " : "MISS"} ${fixture.id.padEnd(30)} ${fixture.label.padEnd(8)} → ${prediction.verdict.padEnd(10)} ${String(prediction.riskScore).padStart(3)}  ${prediction.scamType}`,
    );
  }

  console.log(`
Messages:   ${String(metrics.total)} (${String(metrics.truePositives + metrics.falseNegatives)} scam, ${String(metrics.trueNegatives + metrics.falsePositives)} genuine)
Accuracy:   ${percent(metrics.accuracy)}
Precision:  ${percent(metrics.precision)}
Recall:     ${percent(metrics.recall)}
Genuine messages marked "scam": ${String(metrics.genuineMarkedScam)}
Misses:     ${metrics.misses.length === 0 ? "none" : metrics.misses.map((row) => row.fixture.id).join(", ")}`);
}

main();
