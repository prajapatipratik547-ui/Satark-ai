/**
 * Accuracy evaluation on our labelled fixtures.
 *   npm run eval          rule engine only
 *   npm run eval -- --ai  full pipeline (rules + Gemini); needs GEMINI_API_KEY in .env.
 *                         Uses one Gemini request per fixture, so mind the free-tier daily quota.
 */
import { createGeminiAnalyzer } from "../src/server/ai/gemini.js";
import { analyzeMessage } from "../src/server/analyze.js";
import {
  computeMetrics,
  loadFixtures,
  predictWithRules,
  type EvalRow,
  type Fixture,
  type Prediction,
} from "./metrics.js";

// Stay under the free tier's per-minute limit.
const AI_REQUEST_GAP_MS = 6_500;

function percent(value: number): string {
  return `${(value * 100).toFixed(1)}%`;
}

async function predictWithAi(fixtures: readonly Fixture[]): Promise<EvalRow[]> {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) throw new Error("Set GEMINI_API_KEY in .env to run the AI evaluation.");
  const analyzer = createGeminiAnalyzer({
    apiKey,
    model: process.env.GEMINI_MODEL ?? "gemini-2.5-flash",
  });

  const rows: EvalRow[] = [];
  let aiFailures = 0;
  for (const [index, fixture] of fixtures.entries()) {
    if (index > 0) await new Promise((resolve) => setTimeout(resolve, AI_REQUEST_GAP_MS));
    const result = await analyzeMessage({ text: fixture.text, language: "en" }, analyzer);
    if (!result.aiUsed) aiFailures += 1;
    const prediction: Prediction = {
      verdict: result.verdict,
      riskScore: result.riskScore,
      scamType: result.scamType,
    };
    rows.push({ fixture, prediction });
  }
  if (aiFailures > 0)
    console.warn(`AI unavailable for ${String(aiFailures)} message(s); rules used.`);
  return rows;
}

async function main(): Promise<void> {
  const useAi = process.argv.includes("--ai");
  const fixtures = loadFixtures();
  const rows = useAi
    ? await predictWithAi(fixtures)
    : fixtures.map((fixture) => ({ fixture, prediction: predictWithRules(fixture.text) }));
  const metrics = computeMetrics(rows);

  console.log(`Satark evaluation — ${useAi ? "rules + Gemini" : "rule engine only"}\n`);
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

await main();
