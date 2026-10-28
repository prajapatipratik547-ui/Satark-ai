import { describe, expect, it } from "vitest";
import { redact } from "../src/server/engine/redact.js";

describe("redact", () => {
  it.each([
    ["card number", "Card 4111 1111 1111 1111 is blocked", "Card [CARD] is blocked"],
    ["card number with dashes", "Card 4111-1111-1111-1111", "Card [CARD]"],
    ["Aadhaar", "Aadhaar 2345 6789 0123 linked", "Aadhaar [AADHAAR] linked"],
    ["Aadhaar without spaces", "UID 234567890123", "UID [AADHAAR]"],
    ["mobile number", "Call 98765 43210 now", "Call [PHONE] now"],
    ["mobile number with +91", "Call +919876543210", "Call [PHONE]"],
    ["account number", "A/c 123456789012345 debited", "A/c [ACCOUNT] debited"],
    ["PAN", "PAN ABCDE1234F not linked", "PAN [PAN] not linked"],
    ["OTP after the word", "Your OTP is 482913.", "Your OTP is [OTP]."],
    ["OTP before the word", "482913 is your OTP", "[OTP] is your OTP"],
    ["Hindi OTP", "आपका OTP 739102 है", "आपका OTP [OTP] है"],
  ])("masks %s", (_kind, input, expected) => {
    expect(redact(input)).toBe(expected);
  });

  it("leaves ordinary text, amounts and dates alone", () => {
    const text = "Pay Rs 2,499.00 by 15 Nov 2026 at 9:30 PM.";
    expect(redact(text)).toBe(text);
  });

  it("does not mask the 1930 helpline", () => {
    expect(redact("Call 1930 immediately")).toBe("Call 1930 immediately");
  });

  it("masks several kinds of data in one message", () => {
    const result = redact("OTP 1234 for card 4111111111111111, PAN ABCDE1234F, call 9876543210");
    expect(result).not.toMatch(/\d{4,}/);
    expect(result).toContain("[CARD]");
    expect(result).toContain("[PAN]");
    expect(result).toContain("[PHONE]");
    expect(result).toContain("[OTP]");
  });
});
