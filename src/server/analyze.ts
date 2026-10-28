import { fallbackSummary, playbookTexts } from "../shared/guidance.js";
import type { AiAnalysis, AnalyzeRequest } from "../shared/schema.js";
import type { AnalysisResult, RedFlag } from "../shared/types.js";
import type { AiAnalyzer } from "./ai/gemini.js";
import { findQuotedPhrase, normalizeForMatch, stripContactDetails } from "./ai/sanitize.js";
import { redact } from "./engine/redact.js";
import { NO_SCAM_TYPE, analyzeWithRules, type RuleMatch } from "./engine/rules.js";
import { SUSPICIOUS_THRESHOLD, mergeScores } from "./engine/score.js";

const MAX_RULE_FLAGS = 8;
const MAX_AI_FLAGS = 6;

/** Thrown when only a screenshot was sent and the AI could not read it. */
export class ScreenshotUnreadableError extends Error {
  override name = "ScreenshotUnreadableError";
}

export async function analyzeMessage(
  request: AnalyzeRequest,
  analyzer: AiAnalyzer | null,
): Promise<AnalysisResult> {
  const text = request.text ?? "";
  const image =
    request.imageBase64 && request.imageMimeType
      ? { base64: request.imageBase64, mimeType: request.imageMimeType }
      : undefined;

  // Only redacted text ever leaves the server.
  const ai = analyzer
    ? await analyzer({ text: redact(text), image, language: request.language })
    : null;
  if (image && !text && !ai) throw new ScreenshotUnreadableError("Screenshot could not be read");

  const extractedText = (image && ai?.extractedText?.trim()) || undefined;
  const sources = [text, extractedText ?? ""].filter(Boolean);
  // Rules run on the original text and on whatever was read from the screenshot.
  const rules = analyzeWithRules(sources.join("\n\n"));
  const { riskScore, verdict } = mergeScores({
    ruleScore: rules.score,
    aiScore: ai?.riskScore,
    hasHighSeverity: rules.hasHighSeverity,
  });

  // If the AI calls it safe but the merged verdict is not (e.g. a prompt-injection attempt fooled
  // the model), don't show the AI's reassuring words.
  const aiAgrees = ai !== null && ai.riskScore >= SUSPICIOUS_THRESHOLD === (verdict !== "safe");
  const ruleFlags = toRuleFlags(rules.matches);

  return {
    verdict,
    riskScore,
    scamType: (aiAgrees && stripContactDetails(ai.scamType)) || rules.scamType || NO_SCAM_TYPE,
    summary:
      (aiAgrees && stripContactDetails(ai.summary)) || fallbackSummary(verdict, request.language),
    redFlags: [...ruleFlags, ...toAiFlags(ai, sources, ruleFlags)],
    actions: playbookTexts("received", request.language),
    ...(extractedText ? { extractedText } : {}),
    aiUsed: ai !== null,
    language: request.language,
  };
}

function toRuleFlags(matches: readonly RuleMatch[]): RedFlag[] {
  const seen = new Set<string>();
  const flags: RedFlag[] = [];
  for (const match of matches) {
    const key = normalizeForMatch(match.phrase);
    if (seen.has(key)) continue;
    seen.add(key);
    flags.push({ phrase: match.phrase, reason: match.reason, source: "rules" });
    if (flags.length >= MAX_RULE_FLAGS) break;
  }
  return flags;
}

/** Keeps only AI flags that quote the message and don't repeat a rule finding. */
function toAiFlags(
  ai: AiAnalysis | null,
  sources: readonly string[],
  ruleFlags: readonly RedFlag[],
): RedFlag[] {
  if (!ai) return [];
  const rulePhrases = ruleFlags.map((flag) => normalizeForMatch(flag.phrase));
  const flags: RedFlag[] = [];
  for (const candidate of ai.redFlags) {
    const phrase = findQuotedPhrase(candidate.phrase, sources);
    const reason = stripContactDetails(candidate.reason);
    if (!phrase || !reason) continue;
    const key = normalizeForMatch(phrase);
    const overlapsRule = rulePhrases.some((rule) => rule.includes(key) || key.includes(rule));
    const duplicate = flags.some((flag) => normalizeForMatch(flag.phrase) === key);
    if (overlapsRule || duplicate) continue;
    flags.push({ phrase, reason, source: "ai" });
    if (flags.length >= MAX_AI_FLAGS) break;
  }
  return flags;
}
