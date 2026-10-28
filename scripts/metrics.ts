import { readFileSync } from "node:fs";
import { z } from "zod";
import type { Verdict } from "../src/shared/types.js";
import { analyzeWithRules } from "../src/server/engine/rules.js";
import { mergeScores } from "../src/server/engine/score.js";

const FixtureSchema = z.object({
  id: z.string(),
  label: z.enum(["scam", "genuine"]),
  lang: z.enum(["en", "hi", "hinglish"]),
  category: z.string(),
  text: z.string().min(1),
});

export type Fixture = z.infer<typeof FixtureSchema>;

export interface Prediction {
  verdict: Verdict;
  riskScore: number;
  scamType: string;
}

export interface EvalRow {
  fixture: Fixture;
  prediction: Prediction;
}

export interface Metrics {
  total: number;
  truePositives: number;
  falsePositives: number;
  trueNegatives: number;
  falseNegatives: number;
  accuracy: number;
  precision: number;
  recall: number;
  /** Genuine messages that got the strongest "scam" verdict. Must stay at zero. */
  genuineMarkedScam: number;
  misses: EvalRow[];
}

export const FIXTURES_PATH = new URL("../tests/fixtures/messages.json", import.meta.url);

export function loadFixtures(path: URL = FIXTURES_PATH): Fixture[] {
  return z.array(FixtureSchema).parse(JSON.parse(readFileSync(path, "utf8")));
}

export function predictWithRules(text: string): Prediction {
  const rules = analyzeWithRules(text);
  const { riskScore, verdict } = mergeScores({
    ruleScore: rules.score,
    hasHighSeverity: rules.hasHighSeverity,
  });
  return { verdict, riskScore, scamType: rules.scamType };
}

/** A message counts as flagged (positive) when the verdict is "scam" or "suspicious". */
export function computeMetrics(rows: readonly EvalRow[]): Metrics {
  const isFlagged = (row: EvalRow) => row.prediction.verdict !== "safe";
  const isScam = (row: EvalRow) => row.fixture.label === "scam";

  const truePositives = rows.filter((row) => isScam(row) && isFlagged(row)).length;
  const falseNegatives = rows.filter((row) => isScam(row) && !isFlagged(row)).length;
  const falsePositives = rows.filter((row) => !isScam(row) && isFlagged(row)).length;
  const trueNegatives = rows.filter((row) => !isScam(row) && !isFlagged(row)).length;

  return {
    total: rows.length,
    truePositives,
    falsePositives,
    trueNegatives,
    falseNegatives,
    accuracy: ratio(truePositives + trueNegatives, rows.length),
    precision: ratio(truePositives, truePositives + falsePositives),
    recall: ratio(truePositives, truePositives + falseNegatives),
    genuineMarkedScam: rows.filter((row) => !isScam(row) && row.prediction.verdict === "scam")
      .length,
    misses: rows.filter((row) => isScam(row) !== isFlagged(row)),
  };
}

function ratio(numerator: number, denominator: number): number {
  return denominator === 0 ? 0 : numerator / denominator;
}
