/**
 * Guards on AI-written text. Gemini must never be the source of a phone number, link or reporting
 * channel (those come only from shared/resources.ts), and every AI red flag must quote words that
 * really appear in the message.
 */

const REMOVED = "[removed]";
const MIN_PHRASE_LENGTH = 3;

const CONTACT_PATTERNS: readonly RegExp[] = [
  // Links with a scheme or www.
  /\b(?:https?:\/\/|www\.)\S+/gi,
  // Bare domains such as example.com/path or sbi-kyc.in.
  /\b[a-z0-9-]+(?:\.[a-z0-9-]+)*\.(?:com|in|net|org|info|xyz|top|online|site|app|io|co|me|ly|gov|bank|link|click|live|shop)\b(?:\/\S*)?/gi,
  // Email addresses and UPI IDs.
  /\b[\w.+-]+@[\w-]+(?:\.[\w-]+)*\b/g,
  // Phone-like numbers: 8+ digits, allowing spaces, dashes and a leading +.
  /\+?\d(?:[\s-]?\d){7,}/g,
  // Short numbers right after "call", "dial", "helpline" etc. (e.g. "call 1930").
  /(?<=\b(?:call|dial|phone|helpline|contact|sms|whatsapp)\b\D{0,15})\d{3,}/gi,
];

export function stripContactDetails(text: string): string {
  const stripped = CONTACT_PATTERNS.reduce(
    (current, pattern) => current.replace(pattern, REMOVED),
    text,
  );
  return stripped.replace(/\s{2,}/g, " ").trim();
}

export function normalizeForMatch(text: string): string {
  return text
    .normalize("NFKC")
    .toLowerCase()
    .replace(/[“”"‘’'`]/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

function trimPunctuation(text: string): string {
  return text.replace(/^[\s.,!?;:…।"'“”‘’()-]+|[\s.,!?;:…।"'“”‘’()-]+$/g, "");
}

/**
 * Returns the phrase exactly as it appears in one of the sources (so the UI can highlight it),
 * or null if the AI invented it.
 */
export function findQuotedPhrase(phrase: string, sources: readonly string[]): string | null {
  const cleaned = trimPunctuation(phrase);
  const needle = normalizeForMatch(cleaned);
  if (needle.length < MIN_PHRASE_LENGTH) return null;

  for (const source of sources) {
    const exactIndex = source.toLowerCase().indexOf(cleaned.toLowerCase());
    if (exactIndex >= 0) return source.slice(exactIndex, exactIndex + cleaned.length);
  }
  return sources.some((source) => normalizeForMatch(source).includes(needle)) ? cleaned : null;
}
