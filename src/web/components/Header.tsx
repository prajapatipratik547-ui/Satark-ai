import type { UiStrings } from "../i18n.js";

interface HeaderProps {
  strings: UiStrings;
  largeText: boolean;
  onToggleLargeText: () => void;
}

export function Header({ strings, largeText, onToggleLargeText }: HeaderProps) {
  return (
    <header className="site-header">
      <div className="container header-row">
        <div>
          <h1 className="brand">
            <svg className="brand-icon" viewBox="0 0 32 32" aria-hidden="true" focusable="false">
              <path
                fill="currentColor"
                d="M16 2 4 6.5v8.2C4 22.3 9.1 28.6 16 30c6.9-1.4 12-7.7 12-15.3V6.5z"
              />
              <path
                fill="none"
                stroke="var(--color-brand)"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="3"
                d="m10.5 16 4 4 7-8"
              />
            </svg>
            Satark
          </h1>
          <p className="tagline">{strings.tagline}</p>
          <ul className="highlights">
            <li>{strings.badgeHybrid}</li>
            <li>{strings.badgeLanguages}</li>
            <li>{strings.badgeNoStorage}</li>
          </ul>
        </div>
        <button
          type="button"
          className="toggle"
          aria-pressed={largeText}
          onClick={onToggleLargeText}
        >
          <span aria-hidden="true">A+</span> {strings.largeText}
        </button>
      </div>
    </header>
  );
}
