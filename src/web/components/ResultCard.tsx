import { useEffect, useState } from "react";
import { stepText } from "../../shared/guidance.js";
import { LANGUAGES } from "../../shared/languages.js";
import { PLAYBOOKS, RESOURCES, SITUATIONS, type Situation } from "../../shared/resources.js";
import type { AnalysisResult, Verdict } from "../../shared/types.js";
import type { UiStrings } from "../i18n.js";
import { highlightSegments } from "../lib/highlight.js";
import { isSpeechSupported, speak, stopSpeaking } from "../lib/speech.js";

interface ResultCardProps {
  result: AnalysisResult;
  /** The text the user submitted (empty for screenshot-only checks). */
  message: string;
  strings: UiStrings;
  onCheckAnother: () => void;
}

const VERDICT_WORD: Readonly<Record<Verdict, keyof UiStrings>> = {
  scam: "verdict_scam",
  suspicious: "verdict_suspicious",
  safe: "verdict_safe",
};

export function ResultCard({ result, message, strings, onCheckAnother }: ResultCardProps) {
  const [situation, setSituation] = useState<Situation>("received");
  const verdictWord = strings[VERDICT_WORD[result.verdict]];
  const shownText = message || result.extractedText || "";
  const steps = PLAYBOOKS[situation];

  const readAloudText = [
    verdictWord,
    result.scamType,
    result.summary,
    strings.nextSteps,
    ...steps.map((step) => stepText(step, result.language)),
  ].join(". ");

  const shareText = `${strings.sharePrefix}: ${verdictWord} (${result.scamType}). ${result.summary} ${strings.shareFooter}`;

  return (
    <section
      className={`card result result--${result.verdict}`}
      aria-labelledby="result-heading"
      lang={result.language}
    >
      <h2 id="result-heading">{strings.resultHeading}</h2>

      <div className="verdict">
        <VerdictIcon verdict={result.verdict} />
        <div>
          <p className="verdict-word">{verdictWord}</p>
          <p className="verdict-type">
            {strings.scamTypeLabel}: {result.scamType}
          </p>
        </div>
      </div>

      <div className="score">
        <label htmlFor="risk-meter">{strings.riskScore}</label>
        <meter
          id="risk-meter"
          min={0}
          max={100}
          low={35}
          high={70}
          optimum={0}
          value={result.riskScore}
        >
          {result.riskScore}/100
        </meter>
        <span className="score-value">{result.riskScore}/100</span>
      </div>

      <p className="summary">{result.summary}</p>
      {!result.aiUsed && <p className="notice">{strings.aiOff}</p>}

      {shownText && (
        <>
          <h3>{message ? strings.highlightedHeading : strings.extractedTextLabel}</h3>
          <HighlightedMessage
            text={shownText}
            phrases={result.redFlags.map((flag) => flag.phrase)}
            markLabel={strings.redFlagMark}
          />
        </>
      )}

      <h3>{strings.redFlagsHeading}</h3>
      {result.redFlags.length === 0 ? (
        <p>{strings.noRedFlags}</p>
      ) : (
        <ul className="flags">
          {result.redFlags.map((flag) => (
            <li key={`${flag.source}-${flag.phrase}`}>
              <q>{flag.phrase}</q> <span>{flag.reason}</span>{" "}
              <span className={`tag tag--${flag.source}`}>
                {flag.source === "ai" ? strings.foundByAi : strings.foundByRules}
              </span>
            </li>
          ))}
        </ul>
      )}

      <h3 id="situation-heading">{strings.whatHappened}</h3>
      <div className="situations" role="group" aria-labelledby="situation-heading">
        {SITUATIONS.map((option) => (
          <button
            key={option}
            type="button"
            className={option === "paid" ? "situation situation--urgent" : "situation"}
            aria-pressed={situation === option}
            onClick={() => {
              setSituation(option);
            }}
          >
            {strings[`situation_${option}`]}
          </button>
        ))}
      </div>

      <h3>{strings.nextSteps}</h3>
      <ol className="steps">
        {steps.map((step) => (
          <li key={step.id}>
            {stepText(step, result.language)}
            {step.resource && (
              <>
                {" "}
                <a
                  className={
                    step.resource === "helpline1930" ? "resource resource--call" : "resource"
                  }
                  href={RESOURCES[step.resource].href}
                  rel="noopener noreferrer"
                >
                  {RESOURCES[step.resource].display}
                </a>
              </>
            )}
          </li>
        ))}
      </ol>

      <ResultActions
        strings={strings}
        readAloudText={readAloudText}
        speechLang={LANGUAGES[result.language].speechLang}
        shareText={shareText}
        onCheckAnother={onCheckAnother}
      />
    </section>
  );
}

function HighlightedMessage(props: { text: string; phrases: string[]; markLabel: string }) {
  return (
    <p className="message-text">
      {highlightSegments(props.text, props.phrases).map((segment, index) =>
        segment.flagIndex === undefined ? (
          <span key={index}>{segment.text}</span>
        ) : (
          <mark key={index}>
            <span className="visually-hidden">{props.markLabel}: </span>
            {segment.text}
          </mark>
        ),
      )}
    </p>
  );
}

interface ResultActionsProps {
  strings: UiStrings;
  readAloudText: string;
  speechLang: string;
  shareText: string;
  onCheckAnother: () => void;
}

function ResultActions(props: ResultActionsProps) {
  const { strings } = props;
  const [speaking, setSpeaking] = useState(false);
  const [status, setStatus] = useState("");

  useEffect(() => stopSpeaking, []);

  function toggleReadAloud() {
    if (speaking) {
      stopSpeaking();
      setSpeaking(false);
      return;
    }
    setSpeaking(true);
    speak(props.readAloudText, props.speechLang, () => {
      setSpeaking(false);
    });
  }

  async function share() {
    try {
      if (typeof navigator.share === "function") {
        await navigator.share({ title: "Satark", text: props.shareText });
        return;
      }
      await navigator.clipboard.writeText(props.shareText);
      setStatus(strings.shareCopied);
    } catch {
      // The user cancelled the share sheet or the clipboard is blocked; nothing to do.
    }
  }

  return (
    <div className="actions">
      {isSpeechSupported() && (
        <button
          type="button"
          className="secondary"
          onClick={toggleReadAloud}
          aria-pressed={speaking}
        >
          {speaking ? strings.stopReading : strings.readAloud}
        </button>
      )}
      <button type="button" className="secondary" onClick={() => void share()}>
        {strings.share}
      </button>
      <button type="button" className="secondary" onClick={props.onCheckAnother}>
        {strings.checkAnother}
      </button>
      <p className="share-status" role="status">
        {status}
      </p>
    </div>
  );
}

function VerdictIcon({ verdict }: { verdict: Verdict }) {
  const paths: Record<Verdict, string> = {
    scam: "M12 2 1 21h22L12 2zm1 15h-2v-2h2v2zm0-4h-2V9h2v4z",
    suspicious: "M12 2a10 10 0 1 0 0 20 10 10 0 0 0 0-20zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z",
    safe: "M12 2a10 10 0 1 0 0 20 10 10 0 0 0 0-20zm-2 15-5-5 1.4-1.4 3.6 3.6 7.6-7.6L19 8l-9 9z",
  };
  return (
    <svg className="verdict-icon" viewBox="0 0 24 24" aria-hidden="true" focusable="false">
      <path fill="currentColor" d={paths[verdict]} />
    </svg>
  );
}
