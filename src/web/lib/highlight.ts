export interface Segment {
  text: string;
  /** Index into the phrases array when this segment is a red flag. */
  flagIndex?: number;
}

/**
 * Splits text into plain and highlighted segments. Every case-insensitive occurrence of each phrase
 * is highlighted; when phrases overlap, the earlier (then longer) one wins.
 */
export function highlightSegments(text: string, phrases: readonly string[]): Segment[] {
  const lowerText = text.toLowerCase();
  const ranges: { start: number; end: number; flagIndex: number }[] = [];

  phrases.forEach((phrase, flagIndex) => {
    const needle = phrase.trim().toLowerCase();
    if (!needle) return;
    let from = 0;
    for (;;) {
      const start = lowerText.indexOf(needle, from);
      if (start < 0) break;
      ranges.push({ start, end: start + needle.length, flagIndex });
      from = start + needle.length;
    }
  });

  ranges.sort((a, b) => a.start - b.start || b.end - a.end);

  const segments: Segment[] = [];
  let cursor = 0;
  for (const range of ranges) {
    if (range.start < cursor) continue;
    if (range.start > cursor) segments.push({ text: text.slice(cursor, range.start) });
    segments.push({ text: text.slice(range.start, range.end), flagIndex: range.flagIndex });
    cursor = range.end;
  }
  if (cursor < text.length) segments.push({ text: text.slice(cursor) });
  return segments;
}
