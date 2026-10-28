/** Per-device preferences only (language, text size). Storage may be blocked, so every call is guarded. */

const PREFIX = "satark.";

export function readSetting(key: string): string | null {
  try {
    return window.localStorage.getItem(PREFIX + key);
  } catch {
    return null;
  }
}

export function writeSetting(key: string, value: string): void {
  try {
    window.localStorage.setItem(PREFIX + key, value);
  } catch {
    // Private mode or blocked storage: the preference simply won't persist.
  }
}
