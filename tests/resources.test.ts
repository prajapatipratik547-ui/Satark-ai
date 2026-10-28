import { describe, expect, it } from "vitest";
import { PLAYBOOKS, RESOURCES, SITUATIONS, type Situation } from "../src/shared/resources.js";

function resourcesUsedBy(situation: Situation): string[] {
  return PLAYBOOKS[situation].flatMap((step) => (step.resource ? [step.resource] : []));
}

describe("verified resources", () => {
  it("contains exactly the three verified channels", () => {
    expect(RESOURCES.helpline1930.href).toBe("tel:1930");
    expect(RESOURCES.cybercrimePortal.href).toBe("https://cybercrime.gov.in");
    expect(RESOURCES.chakshu.href).toBe("https://sancharsaathi.gov.in/sfc/");
    expect(Object.keys(RESOURCES)).toHaveLength(3);
  });

  it("uses only official .gov.in websites over https", () => {
    for (const { href } of Object.values(RESOURCES)) {
      if (href.startsWith("tel:")) continue;
      const url = new URL(href);
      expect(url.protocol).toBe("https:");
      expect(url.hostname.endsWith(".gov.in")).toBe(true);
    }
  });
});

describe("playbooks", () => {
  it("has a playbook for every situation", () => {
    for (const situation of SITUATIONS) expect(PLAYBOOKS[situation].length).toBeGreaterThan(2);
  });

  it("'only received' sends you to Chakshu, not the money-lost helpline", () => {
    expect(resourcesUsedBy("received")).toContain("chakshu");
    expect(resourcesUsedBy("received")).not.toContain("helpline1930");
  });

  it("'clicked or shared details' covers OTP, apps, bank and Chakshu", () => {
    const text = PLAYBOOKS.clicked.map((step) => step.text).join(" ");
    expect(text).toMatch(/OTP/);
    expect(text).toMatch(/AnyDesk/);
    expect(text).toMatch(/printed on your card/);
    expect(resourcesUsedBy("clicked")).toContain("chakshu");
  });

  it("'sent money' starts with calling 1930, then cybercrime.gov.in", () => {
    expect(PLAYBOOKS.paid[0]?.resource).toBe("helpline1930");
    expect(resourcesUsedBy("paid")).toContain("cybercrimePortal");
    expect(PLAYBOOKS.paid.map((step) => step.text).join(" ")).toMatch(/recover/);
  });

  it("mentions no phone number or website other than the verified ones", () => {
    const allowed = new Set(["1930", "cybercrime.gov.in"]);
    for (const step of Object.values(PLAYBOOKS).flat()) {
      const numbers = step.text.match(/\d{3,}/g) ?? [];
      const domains = step.text.match(/[a-z0-9-]+\.(?:gov\.)?in\b|https?:\/\/\S+/gi) ?? [];
      for (const found of [...numbers, ...domains]) expect(allowed).toContain(found);
    }
  });

  it("uses unique step ids for translation", () => {
    const ids = Object.values(PLAYBOOKS)
      .flat()
      .map((step) => step.id);
    expect(new Set(ids).size).toBe(ids.length);
  });
});
