import { describe, expect, it } from "vitest";
import { stepText } from "../src/shared/guidance.js";
import { LANGUAGE_CODES, isLanguageCode } from "../src/shared/languages.js";
import { PLAYBOOK_TRANSLATIONS } from "../src/shared/playbook-translations.js";
import { PLAYBOOKS } from "../src/shared/resources.js";
import { RULES } from "../src/server/engine/rules.js";
import { TRANSLATED_RULE_IDS } from "../src/server/engine/rule-reasons.js";
import { getStrings } from "../src/web/i18n.js";
import { groupFlags } from "../src/web/lib/flags.js";
import { highlightSegments } from "../src/web/lib/highlight.js";
import { fitWithin } from "../src/web/lib/image.js";

describe("isLanguageCode", () => {
  it("accepts only the 8 supported languages", () => {
    for (const code of LANGUAGE_CODES) expect(isLanguageCode(code)).toBe(true);
    for (const value of ["fr", "", "EN", null, undefined, 1])
      expect(isLanguageCode(value)).toBe(false);
  });
});

describe("groupFlags", () => {
  it("shows each reason once, listing all its phrases in order", () => {
    const groups = groupFlags([
      { phrase: "Inspector", reason: "Claims to be police.", source: "rules" },
      { phrase: "digital arrest", reason: "Not a real thing.", source: "rules" },
      { phrase: "CBI", reason: "Claims to be police.", source: "rules" },
      { phrase: "pay now", reason: "Claims to be police.", source: "ai" },
    ]);
    expect(groups).toEqual([
      { phrases: ["Inspector", "CBI"], reason: "Claims to be police.", source: "rules" },
      { phrases: ["digital arrest"], reason: "Not a real thing.", source: "rules" },
      { phrases: ["pay now"], reason: "Claims to be police.", source: "ai" },
    ]);
  });
});

describe("highlightSegments", () => {
  it("marks every occurrence, ignoring case, and keeps the rest as plain text", () => {
    const segments = highlightSegments("Share OTP now. share otp!", ["share otp"]);
    expect(segments).toEqual([
      { text: "Share OTP", flagIndex: 0 },
      { text: " now. " },
      { text: "share otp", flagIndex: 0 },
      { text: "!" },
    ]);
  });

  it("does not overlap highlights", () => {
    const segments = highlightSegments("digital arrest warrant", [
      "digital arrest",
      "arrest warrant",
    ]);
    expect(segments.map((s) => s.text).join("")).toBe("digital arrest warrant");
    expect(segments.filter((s) => s.flagIndex !== undefined)).toHaveLength(1);
  });

  it("returns the whole text when nothing matches", () => {
    expect(highlightSegments("hello", ["bye", ""])).toEqual([{ text: "hello" }]);
  });

  it("works with Devanagari", () => {
    const segments = highlightSegments("आप डिजिटल अरेस्ट में हैं", ["डिजिटल अरेस्ट"]);
    expect(segments[1]).toEqual({ text: "डिजिटल अरेस्ट", flagIndex: 0 });
  });
});

describe("fitWithin (screenshot resizing)", () => {
  it("scales the longer side down to 1600 px", () => {
    expect(fitWithin(3200, 1600)).toEqual({ width: 1600, height: 800 });
    expect(fitWithin(1080, 2400)).toEqual({ width: 720, height: 1600 });
  });

  it("never upscales small images", () => {
    expect(fitWithin(800, 600)).toEqual({ width: 800, height: 600 });
  });
});

describe("translations", () => {
  const stepIds = Object.values(PLAYBOOKS)
    .flat()
    .map((step) => step.id);

  it.each(Object.entries(PLAYBOOK_TRANSLATIONS))(
    "%s translates every playbook step",
    (_language, translations) => {
      expect(Object.keys(translations).sort()).toEqual([...stepIds].sort());
    },
  );

  it.each(Object.entries(PLAYBOOK_TRANSLATIONS))(
    "%s keeps exactly the verified channels and no other numbers or sites",
    (_language, translations) => {
      expect(translations["paid.call1930"]).toContain("1930");
      expect(translations["paid.reportPortal"]).toContain("cybercrime.gov.in");
      for (const text of Object.values(translations)) {
        for (const number of text.match(/\d{3,}/g) ?? []) expect(number).toBe("1930");
        for (const site of text.match(/[a-z0-9-]+\.[a-z.]{2,}/gi) ?? []) {
          expect(["cybercrime.gov.in", ".apk"]).toContain(site);
        }
      }
    },
  );

  it("falls back to English for any missing step", () => {
    const [firstStep] = PLAYBOOKS.received;
    expect(firstStep && stepText(firstStep, "en")).toBe(firstStep?.text);
  });

  it("has a Hindi reason for every rule", () => {
    expect([...TRANSLATED_RULE_IDS].sort()).toEqual(RULES.map((rule) => rule.id).sort());
  });

  it.each(LANGUAGE_CODES)("gives %s a non-empty string for every UI key", (language) => {
    const strings = getStrings(language);
    for (const key of Object.keys(strings) as (keyof typeof strings)[]) {
      expect(strings[key].trim()).not.toBe("");
    }
    expect(strings.helplineCall).toContain("1930");
  });
});
