import { useEffect, useRef, useState } from "react";
import { LANGUAGE_CODES, type LanguageCode } from "../shared/languages.js";
import type { AnalysisResult } from "../shared/types.js";
import { Footer } from "./components/Footer.js";
import { Header } from "./components/Header.js";
import { HelplineStrip } from "./components/HelplineStrip.js";
import { InputCard, type InputMode } from "./components/InputCard.js";
import { ResultCard } from "./components/ResultCard.js";
import { getStrings, type UiStrings } from "./i18n.js";
import { ApiError, analyzeMessage, type AnalyzeBody } from "./lib/api.js";
import { checkImageFile, prepareImage, type PreparedImage } from "./lib/image.js";
import { readSetting, writeSetting } from "./lib/storage.js";

type ErrorKey = keyof Pick<
  UiStrings,
  | "error_generic"
  | "error_rateLimit"
  | "error_image"
  | "error_empty"
  | "error_imageType"
  | "error_imageSize"
>;

interface CheckInput {
  text: string;
  image: PreparedImage | null;
}

function initialLanguage(): LanguageCode {
  const stored = readSetting("language");
  if (stored && (LANGUAGE_CODES as readonly string[]).includes(stored))
    return stored as LanguageCode;
  const browser = navigator.language.split("-")[0] ?? "en";
  return (LANGUAGE_CODES as readonly string[]).includes(browser) ? (browser as LanguageCode) : "en";
}

export function App() {
  const [language, setLanguage] = useState<LanguageCode>(initialLanguage);
  const [largeText, setLargeText] = useState(() => readSetting("largeText") === "1");
  const [mode, setMode] = useState<InputMode>("text");
  const [text, setText] = useState("");
  const [image, setImage] = useState<PreparedImage | null>(null);
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [checkedText, setCheckedText] = useState("");
  const [loading, setLoading] = useState(false);
  const [errorKey, setErrorKey] = useState<ErrorKey | null>(null);
  const [focusRequest, setFocusRequest] = useState(0);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const abortRef = useRef<AbortController | null>(null);
  const lastCheckRef = useRef<CheckInput | null>(null);
  const resultRegionRef = useRef<HTMLDivElement>(null);
  const strings = getStrings(language);
  const showingResultArea = loading || result !== null;

  useEffect(() => {
    document.documentElement.lang = language;
    writeSetting("language", language);
  }, [language]);

  useEffect(() => {
    document.documentElement.toggleAttribute("data-large-text", largeText);
    writeSetting("largeText", largeText ? "1" : "0");
  }, [largeText]);

  useEffect(() => {
    if (focusRequest > 0) textareaRef.current?.focus();
  }, [focusRequest]);

  // Bring the spinner, then the verdict, into view so nobody has to scroll to see what happened.
  useEffect(() => {
    if (showingResultArea) scrollIntoViewGently(resultRegionRef.current);
  }, [showingResultArea, result]);

  async function runCheck(input: CheckInput, checkLanguage: LanguageCode) {
    if (!input.text.trim() && !input.image) {
      setErrorKey("error_empty");
      return;
    }
    abortRef.current?.abort();
    const controller = new AbortController();
    abortRef.current = controller;
    lastCheckRef.current = input;
    setLoading(true);
    setErrorKey(null);
    setResult(null);

    const body: AnalyzeBody = input.image
      ? {
          imageBase64: input.image.base64,
          imageMimeType: input.image.mimeType,
          language: checkLanguage,
        }
      : { text: input.text, language: checkLanguage };
    try {
      const analysis = await analyzeMessage(body, controller.signal);
      setCheckedText(input.image ? "" : input.text);
      setResult(analysis);
    } catch (error) {
      if (controller.signal.aborted) return;
      const kind = error instanceof ApiError ? error.kind : "generic";
      setErrorKey(
        kind === "rateLimit"
          ? "error_rateLimit"
          : kind === "image"
            ? "error_image"
            : "error_generic",
      );
    } finally {
      if (abortRef.current === controller) setLoading(false);
    }
  }

  function submitCurrent() {
    void runCheck({ text, image: mode === "image" ? image : null }, language);
  }

  function changeLanguage(next: LanguageCode) {
    setLanguage(next);
    // Re-explain the current result in the newly chosen language.
    if (result && lastCheckRef.current) void runCheck(lastCheckRef.current, next);
  }

  function runExample(exampleText: string) {
    setMode("text");
    setText(exampleText);
    void runCheck({ text: exampleText, image: null }, language);
  }

  async function selectImage(file: File) {
    const problem = checkImageFile(file);
    if (problem) {
      setErrorKey(problem === "type" ? "error_imageType" : "error_imageSize");
      return;
    }
    try {
      const prepared = await prepareImage(file);
      clearImage();
      setImage(prepared);
      setErrorKey(null);
    } catch {
      setErrorKey("error_imageSize");
    }
  }

  function clearImage() {
    if (image) URL.revokeObjectURL(image.previewUrl);
    setImage(null);
  }

  function checkAnother() {
    abortRef.current?.abort();
    setResult(null);
    setText("");
    clearImage();
    setErrorKey(null);
    setMode("text");
    setFocusRequest((count) => count + 1);
  }

  return (
    <>
      <a className="skip-link" href="#main">
        {strings.skipToContent}
      </a>
      <Header
        strings={strings}
        largeText={largeText}
        onToggleLargeText={() => {
          setLargeText((value) => !value);
        }}
      />
      <HelplineStrip strings={strings} />

      <main id="main" className="container" tabIndex={-1}>
        <InputCard
          strings={strings}
          language={language}
          onLanguageChange={changeLanguage}
          mode={mode}
          onModeChange={setMode}
          text={text}
          onTextChange={setText}
          imagePreviewUrl={image?.previewUrl ?? null}
          onImageSelect={(file) => void selectImage(file)}
          onImageClear={clearImage}
          onExample={runExample}
          onSubmit={submitCurrent}
          loading={loading}
          error={errorKey ? strings[errorKey] : null}
          textareaRef={textareaRef}
        />

        <div ref={resultRegionRef} className="result-region" aria-live="polite" aria-busy={loading}>
          {loading && (
            <p className="loading">
              <span className="spinner" aria-hidden="true" />
              {strings.checking}
            </p>
          )}
          {result && (
            <ResultCard
              result={result}
              message={checkedText}
              strings={strings}
              onCheckAnother={checkAnother}
            />
          )}
        </div>
      </main>

      <Footer strings={strings} />
    </>
  );
}

/** Smoothness comes from CSS scroll-behavior, which prefers-reduced-motion switches off. */
function scrollIntoViewGently(element: HTMLElement | null) {
  if (!element || typeof element.scrollIntoView !== "function") return;
  element.scrollIntoView({ block: "start" });
}
