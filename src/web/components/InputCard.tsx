import {
  useRef,
  useState,
  type DragEvent,
  type KeyboardEvent,
  type SubmitEvent,
  type Ref,
} from "react";
import { LANGUAGES, LANGUAGE_CODES, type LanguageCode } from "../../shared/languages.js";
import { MAX_TEXT_LENGTH } from "../../shared/limits.js";
import type { UiStrings } from "../i18n.js";
import { EXAMPLES } from "../lib/examples.js";

export type InputMode = "text" | "image";

interface InputCardProps {
  strings: UiStrings;
  language: LanguageCode;
  onLanguageChange: (language: LanguageCode) => void;
  mode: InputMode;
  onModeChange: (mode: InputMode) => void;
  text: string;
  onTextChange: (text: string) => void;
  imagePreviewUrl: string | null;
  onImageSelect: (file: File) => void;
  onImageClear: () => void;
  onExample: (text: string) => void;
  onSubmit: () => void;
  loading: boolean;
  error: string | null;
  textareaRef: Ref<HTMLTextAreaElement>;
}

const MODES: readonly InputMode[] = ["text", "image"];

export function InputCard(props: InputCardProps) {
  const { strings, mode, onModeChange, loading, error } = props;
  const tabRefs = useRef<Partial<Record<InputMode, HTMLButtonElement | null>>>({});

  function handleTabKey(event: KeyboardEvent<HTMLButtonElement>) {
    if (event.key !== "ArrowLeft" && event.key !== "ArrowRight") return;
    event.preventDefault();
    const next = MODES[(MODES.indexOf(mode) + 1) % MODES.length] ?? "text";
    onModeChange(next);
    tabRefs.current[next]?.focus();
  }

  function handleSubmit(event: SubmitEvent<HTMLFormElement>) {
    event.preventDefault();
    props.onSubmit();
  }

  return (
    <section className="card" aria-labelledby="input-heading">
      <h2 id="input-heading">{strings.inputHeading}</h2>
      <form onSubmit={handleSubmit} noValidate>
        <div className="field">
          <label htmlFor="language">{strings.languageLabel}</label>
          <select
            id="language"
            value={props.language}
            onChange={(event) => {
              props.onLanguageChange(event.target.value as LanguageCode);
            }}
          >
            {LANGUAGE_CODES.map((code) => (
              <option key={code} value={code} lang={code}>
                {LANGUAGES[code].nativeName}
                {code === "en" ? "" : ` (${LANGUAGES[code].englishName})`}
              </option>
            ))}
          </select>
        </div>

        <div className="tabs" role="tablist" aria-label={strings.inputHeading}>
          {MODES.map((tabMode) => (
            <button
              key={tabMode}
              ref={(element) => {
                tabRefs.current[tabMode] = element;
              }}
              type="button"
              role="tab"
              id={`tab-${tabMode}`}
              aria-selected={mode === tabMode}
              aria-controls={`panel-${tabMode}`}
              tabIndex={mode === tabMode ? 0 : -1}
              onClick={() => {
                onModeChange(tabMode);
              }}
              onKeyDown={handleTabKey}
            >
              {tabMode === "text" ? strings.tabPaste : strings.tabUpload}
            </button>
          ))}
        </div>

        {mode === "text" ? <TextPanel {...props} /> : <ImagePanel {...props} />}

        <div className="examples">
          <p id="examples-label" className="examples-label">
            {strings.examplesLabel}
          </p>
          <ul className="chips" aria-labelledby="examples-label">
            {EXAMPLES.map((example) => (
              <li key={example.labelKey}>
                <button
                  type="button"
                  className="chip"
                  onClick={() => {
                    props.onExample(example.text);
                  }}
                >
                  {strings[example.labelKey]}
                </button>
              </li>
            ))}
          </ul>
        </div>

        {error && (
          <p className="form-error" role="alert">
            {error}
          </p>
        )}

        <button type="submit" className="primary" disabled={loading} aria-busy={loading}>
          {loading ? strings.checking : strings.check}
        </button>
      </form>
    </section>
  );
}

function TextPanel({ strings, text, onTextChange, textareaRef }: InputCardProps) {
  return (
    <div role="tabpanel" id="panel-text" aria-labelledby="tab-text" className="panel">
      <label htmlFor="message">{strings.messageLabel}</label>
      <textarea
        id="message"
        ref={textareaRef}
        value={text}
        maxLength={MAX_TEXT_LENGTH}
        rows={6}
        placeholder={strings.messagePlaceholder}
        onChange={(event) => {
          onTextChange(event.target.value);
        }}
      />
    </div>
  );
}

function ImagePanel({ strings, imagePreviewUrl, onImageSelect, onImageClear }: InputCardProps) {
  const [dragging, setDragging] = useState(false);

  function handleDrop(event: DragEvent<HTMLDivElement>) {
    event.preventDefault();
    setDragging(false);
    const file = event.dataTransfer.files[0];
    if (file) onImageSelect(file);
  }

  return (
    <div role="tabpanel" id="panel-image" aria-labelledby="tab-image" className="panel">
      {imagePreviewUrl ? (
        <div className="preview">
          <img src={imagePreviewUrl} alt={strings.screenshotAlt} />
          <button type="button" className="secondary" onClick={onImageClear}>
            {strings.removeImage}
          </button>
        </div>
      ) : (
        // Drag-and-drop is an extra for mouse users; the native file input inside is the
        // keyboard and screen-reader path, so this wrapper needs no role of its own.
        // eslint-disable-next-line jsx-a11y/no-static-element-interactions
        <div
          className={dragging ? "dropzone dropzone--active" : "dropzone"}
          onDragOver={(event) => {
            event.preventDefault();
            setDragging(true);
          }}
          onDragLeave={() => {
            setDragging(false);
          }}
          onDrop={handleDrop}
        >
          <label htmlFor="screenshot">
            <span className="dropzone-prompt">{strings.uploadPrompt}</span>
            <span className="dropzone-hint">{strings.uploadHint}</span>
          </label>
          <input
            id="screenshot"
            type="file"
            accept="image/png,image/jpeg,image/webp"
            onChange={(event) => {
              const file = event.target.files?.[0];
              if (file) onImageSelect(file);
              event.target.value = "";
            }}
          />
        </div>
      )}
    </div>
  );
}
