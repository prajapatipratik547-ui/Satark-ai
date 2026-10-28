import { RESOURCES } from "../../shared/resources.js";
import type { UiStrings } from "../i18n.js";

export function HelplineStrip({ strings }: { strings: UiStrings }) {
  return (
    <aside className="helpline" aria-label={RESOURCES.helpline1930.name}>
      <div className="container helpline-row">
        <span>{strings.helplineQuestion}</span>
        <a className="helpline-call" href={RESOURCES.helpline1930.href}>
          <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
            <path
              fill="currentColor"
              d="M6.6 10.8a15.1 15.1 0 0 0 6.6 6.6l2.2-2.2c.3-.3.7-.4 1-.2 1.1.4 2.3.6 3.6.6.6 0 1 .4 1 1V20c0 .6-.4 1-1 1A17 17 0 0 1 3 4c0-.6.4-1 1-1h3.5c.6 0 1 .4 1 1 0 1.3.2 2.5.6 3.6.1.3 0 .7-.2 1z"
            />
          </svg>
          {strings.helplineCall}
        </a>
      </div>
    </aside>
  );
}
