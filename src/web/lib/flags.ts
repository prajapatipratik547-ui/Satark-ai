import type { RedFlag, RedFlagSource } from "../../shared/types.js";

export interface FlagGroup {
  phrases: string[];
  reason: string;
  source: RedFlagSource;
}

/** Groups red flags that share a reason (e.g. "Inspector", "CBI", "customs") so each reason is shown once. */
export function groupFlags(flags: readonly RedFlag[]): FlagGroup[] {
  const groups = new Map<string, FlagGroup>();
  for (const flag of flags) {
    const key = `${flag.source}\u0000${flag.reason}`;
    const group = groups.get(key);
    if (group) group.phrases.push(flag.phrase);
    else groups.set(key, { phrases: [flag.phrase], reason: flag.reason, source: flag.source });
  }
  return [...groups.values()];
}
