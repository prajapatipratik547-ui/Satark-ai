import { RESOURCES } from "../../shared/resources.js";
import type { UiStrings } from "../i18n.js";

export function Footer({ strings }: { strings: UiStrings }) {
  return (
    <footer className="site-footer">
      <div className="container">
        <p>{strings.privacy}</p>
        <nav aria-label={strings.officialHelp}>
          <ul className="footer-links">
            <li>
              <a href={RESOURCES.cybercrimePortal.href} rel="noopener noreferrer">
                {RESOURCES.cybercrimePortal.display}
              </a>
            </li>
            <li>
              <a href={RESOURCES.chakshu.href} rel="noopener noreferrer">
                {RESOURCES.chakshu.display}
              </a>
            </li>
          </ul>
        </nav>
      </div>
    </footer>
  );
}
