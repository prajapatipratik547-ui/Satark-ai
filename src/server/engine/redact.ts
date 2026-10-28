/**
 * Masks personal data before any text leaves the server for the AI. The rule engine always runs on the
 * original text; only the AI sees the redacted copy. Order matters: longer number formats go first so
 * a card number is not half-masked as an Aadhaar or account number.
 */

interface Redaction {
  label: string;
  pattern: RegExp;
}

const REDACTIONS: readonly Redaction[] = [
  // 16-digit card numbers, plain or grouped 4-4-4-4 with spaces or dashes.
  { label: "[CARD]", pattern: /(?<!\d)\d{4}([ -]?)\d{4}\1\d{4}\1\d{4}(?!\d)/g },
  // Indian mobile numbers, with optional +91 prefix. Before Aadhaar so "+919876543210" stays a phone.
  { label: "[PHONE]", pattern: /(?:\+91[\s-]?|(?<!\d))[6-9]\d{4}[\s-]?\d{5}(?!\d)/g },
  // 12-digit Aadhaar, usually written 4-4-4.
  { label: "[AADHAAR]", pattern: /(?<!\d)\d{4}[ -]?\d{4}[ -]?\d{4}(?!\d)/g },
  // Bank account numbers: any remaining run of 9–18 digits.
  { label: "[ACCOUNT]", pattern: /(?<!\d)\d{9,18}(?!\d)/g },
  // PAN: 5 letters, 4 digits, 1 letter.
  { label: "[PAN]", pattern: /\b[A-Z]{5}\d{4}[A-Z]\b/gi },
  // OTPs: 4–8 digit codes next to words like OTP, code or PIN.
  {
    label: "[OTP]",
    pattern:
      /(?<=\b(?:otp|code|pin|mpin|password|passcode)\b[^\d\n]{0,20})(?<!\d)\d{4,8}(?!\d)|(?<!\d)\d{4,8}(?!\d)(?=[^\d\n]{0,30}\b(?:otp|code|pin|mpin|password|passcode)\b)/gi,
  },
];

export function redact(text: string): string {
  return REDACTIONS.reduce((current, { label, pattern }) => current.replace(pattern, label), text);
}
