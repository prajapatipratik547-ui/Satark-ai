/**
 * Deterministic scam-signal rules. Pure functions only: fast, explainable, and still working when the
 * AI is down. Patterns are case-insensitive, global (for character offsets) and use bounded
 * repetition only, so attacker-written input cannot trigger catastrophic backtracking.
 * Note: \b is ASCII-only in JS, so Devanagari alternatives are written without it.
 */

export type SignalCategory =
  | "digital_arrest"
  | "safe_account"
  | "remote_access"
  | "upi"
  | "kyc"
  | "electricity"
  | "parcel"
  | "lottery"
  | "job"
  | "investment"
  | "authority"
  | "credentials"
  | "personal_info"
  | "link"
  | "threat"
  | "urgency"
  | "contact"
  | "injection";

export type Severity = "high" | "normal";

export interface Rule {
  id: string;
  category: SignalCategory;
  weight: number;
  /** A high-severity hit forces the verdict to at least "suspicious". */
  severity: Severity;
  pattern: RegExp;
  reason: string;
}

export interface RuleMatch {
  ruleId: string;
  category: SignalCategory;
  severity: Severity;
  weight: number;
  phrase: string;
  start: number;
  end: number;
  reason: string;
}

export interface RuleAnalysis {
  score: number;
  matches: RuleMatch[];
  hasHighSeverity: boolean;
  scamType: string;
}

const MAX_MATCHES_PER_RULE = 3;
const MAX_SCORE = 100;

export const RULES: readonly Rule[] = [
  // --- Urgency and threats ---
  {
    id: "urgency-deadline",
    category: "urgency",
    weight: 15,
    severity: "normal",
    pattern:
      /\b(?:within\s+\d{1,3}\s*(?:hours?|hrs?|minutes?|mins?|days?)|immediately|urgent(?:ly)?|right\s+now|today\s+itself|tonight|last\s+chance|final\s+(?:notice|warning|reminder)|limited\s+(?:seats|time|offer))\b|आज\s+ही|आज\s+रात|तुरंत|24\s+घंटे|\b(?:turant|jaldi(?:\s+se)?|aaj\s+hi|aaj\s+raat)\b/gi,
    reason: "Creates time pressure so you act before you think.",
  },
  {
    id: "account-block-threat",
    category: "threat",
    weight: 25,
    severity: "normal",
    pattern:
      /\b(?:account|a\/c|card|sim|number|connection|kyc|upi|pan|aadhaa?r|yono|wallet)\b[^.!?\n]{0,40}?\b(?:will|shall|would)\s+be\s+(?:blocked|suspended|deactivated|frozen|closed|disconnected|terminated|cancelled|blacklisted)\b|\b(?:block|band|bandh|suspend)\s+(?:ho|kar\s+diya)\s+(?:jayega|jaega|jayegi|jaegi|jaayega)\b|(?:ब्लॉक|बंद)\s+(?:हो\s+जाएगा|हो\s+जायेगा|हो\s+जाएगी|कर\s+दिया\s+जाएगा|कर\s+दी\s+जाएगी)/gi,
    reason: "Threatens to block your account or service to scare you.",
  },

  // --- Credentials and personal data ---
  {
    id: "credential-request",
    category: "credentials",
    weight: 40,
    severity: "high",
    pattern:
      /(?<!\b(?:not|never|don'?t|nor)\s+)\b(?:share|send|tell|provide|give|forward|read\s+out|confirm|disclose)\s+(?:me\s+|us\s+)?(?:the\s+|your\s+|this\s+|that\s+)?(?:\d{1,2}[-\s]?digit\s+)?(?:otp|one[-\s]time\s+password|upi\s+pin|atm\s+pin|pin|cvv|mpin|password|verification\s+code|code)\b/gi,
    reason: "Asks for your OTP, PIN, CVV or password. Banks never ask for these.",
  },
  {
    id: "credential-request-hindi",
    category: "credentials",
    weight: 40,
    severity: "high",
    pattern:
      /\b(?:otp|pin|cvv|code)\b(?:(?!\b(?:mat|na|nahi|nahin|never|not)\b)[^.!?।\n]){0,30}?\b(?:batao|bata\s+do|bataiye|bataye|bataen|bhejo|bhej\s+do|bhejiye|share\s+karo|share\s+kare|share\s+karein|share\s+kijiye)\b|(?:OTP|ओटीपी|पिन)(?:(?!(?:मत|ना|नहीं)\s)[^.!?।\n]){0,30}?(?:बताएं|बताइए|बताओ|बता\s+दें|बता\s+दो|भेजें|भेजो|भेज\s+दें|शेयर\s+करें|शेयर\s+करो)/gi,
    reason: "Asks you to tell or send your OTP or PIN. Banks never ask for these.",
  },
  {
    id: "personal-info-request",
    category: "personal_info",
    weight: 25,
    severity: "normal",
    pattern:
      /(?<!\b(?:not|never|don'?t)\s+)\b(?:share|send|provide|confirm|update|give)\s+(?:me\s+|us\s+)?(?:your\s+)?(?:aadhaa?r|pan|debit\s+card|credit\s+card|atm\s+card|card|bank|account|net\s?banking)\b(?:\s+(?:number|no\.?|details))?/gi,
    reason: "Asks for Aadhaar, PAN, card or bank details.",
  },

  // --- KYC ---
  {
    id: "kyc-update",
    category: "kyc",
    weight: 30,
    severity: "normal",
    pattern:
      /\b(?:update|complete|verify|re-?verify|renew)\s+(?:your\s+)?(?:e-?)?kyc\b|\b(?:e-?)?kyc\s+(?:update|verification|is\s+(?:pending|expired|incomplete|not\s+updated)|has\s+expired|pending|expired|suspended|incomplete)\b|(?:केवाईसी|KYC)\s*(?:अपडेट|अधूरा|अधूरी|लंबित|समाप्त)/gi,
    reason: "Fake KYC update. Banks don't ask you to update KYC through a link in a message.",
  },

  // --- Digital arrest and impersonating officials ---
  {
    id: "digital-arrest",
    category: "digital_arrest",
    weight: 50,
    severity: "high",
    pattern: /digital\s*arrest|डिजिटल\s*(?:अरेस्ट|गिरफ्तारी)/gi,
    reason:
      '"Digital arrest" does not exist in Indian law. Police never arrest anyone over a call.',
  },
  {
    id: "legal-threat",
    category: "authority",
    weight: 30,
    severity: "normal",
    pattern:
      /\b(?:arrest\s+warrant|warrant\s+(?:has\s+been\s+|is\s+)?issued|fir\s+(?:has\s+been\s+|is\s+)?(?:registered|filed|lodged)|money\s+laundering|(?:drugs?|narcotics)\s+(?:were\s+|was\s+)?(?:found|seized)|illegal\s+(?:items?|drugs?|parcel|goods)|case\s+(?:is\s+|has\s+been\s+)?(?:registered|filed)\s+against\s+you|you\s+will\s+be\s+arrested|arrest\s+ho\s+(?:jaoge|jayenge|jaenge))\b|गिरफ्तारी\s*वारंट|मनी\s*लॉन्ड्रिंग|गिरफ्तार\s+(?:किया|हो)/gi,
    reason: "Threatens arrest or a criminal case to frighten you into paying.",
  },
  {
    id: "isolation-tactic",
    category: "digital_arrest",
    weight: 30,
    severity: "normal",
    pattern:
      /\b(?:stay\s+on\s+(?:the\s+)?(?:video\s+)?call|(?:do\s+not|don'?t)\s+disconnect|(?:do\s+not|don'?t)\s+(?:tell|inform)\s+(?:anyone|your\s+family|family)|keep\s+this\s+(?:confidential|secret)|kisi\s+ko\s+(?:mat|na)\s+batana)\b|किसी\s+को\s+(?:मत|ना|न)\s+बताना|वीडियो\s+कॉल\s+पर\s+(?:बने|रहें)/gi,
    reason: "Tries to keep you isolated so nobody can warn you.",
  },
  {
    id: "authority-impersonation",
    category: "authority",
    weight: 20,
    severity: "normal",
    pattern:
      /\b(?:cbi|ncb|enforcement\s+directorate|cyber\s+(?:crime\s+)?(?:police|cell)|(?:mumbai|delhi)\s+police|police\s+(?:officer|inspector|station)|inspector|customs|narcotics|trai|rbi|income\s+tax\s+(?:officer|department))\b|पुलिस|सीबीआई|कस्टम्स/gi,
    reason:
      "Claims to be police, CBI, customs or a regulator. They don't contact people like this.",
  },

  // --- UPI ---
  {
    id: "upi-pin-to-receive",
    category: "upi",
    weight: 45,
    severity: "normal",
    pattern:
      /\b(?:enter|put|type|use)\s+(?:your\s+)?(?:upi\s+)?m?pin\s+(?:to|and)\s+(?:receive|get|accept|claim)\b|\b(?:receive|get|claim)\s+(?:the\s+|your\s+)?(?:money|payment|amount|refund|cashback|prize)\b[^.!?\n]{0,40}?\b(?:enter|approve|put|type)\s+(?:your\s+)?(?:upi\s+)?m?pin\b|\bpin\s+(?:daalo|daaliye|dalo|daal\s+do|enter\s+karo)\b|पिन\s+(?:डालें|डालो|डाल\s+दें)/gi,
    reason: "You never need to enter your UPI PIN to receive money. A PIN only sends money.",
  },
  {
    id: "upi-collect-request",
    category: "upi",
    weight: 30,
    severity: "normal",
    pattern:
      /\b(?:collect\s+request|payment\s+request\b[^.!?\n]{0,30}?\b(?:approve|accept)|approve\s+(?:the\s+)?(?:payment\s+)?request\s+to\s+(?:receive|get)|accept\s+(?:the\s+)?request\s+to\s+receive|request\s+(?:approve|accept)\s+kar\s+(?:do|dijiye|dena))\b/gi,
    reason: "A UPI collect request takes money from you. Approving it is paying, not receiving.",
  },

  // --- Lottery and prizes ---
  {
    id: "lottery-prize",
    category: "lottery",
    weight: 35,
    severity: "normal",
    pattern:
      /\b(?:lottery|lucky\s+draw|jackpot|kbc|kaun\s+banega\s+crorepati|you(?:\s+have|'ve)\s+won|has\s+won|won\s+(?:a\s+)?(?:prize|cash|car|iphone|reward)|prize\s+money|claim\s+your\s+(?:prize|reward)|lottery\s+lagi)\b|लॉटरी|इनाम\s+जीत|लकी\s+ड्रॉ/gi,
    reason: "Promises a lottery or prize you never entered.",
  },
  {
    id: "advance-fee",
    category: "lottery",
    weight: 20,
    severity: "normal",
    pattern:
      /\b(?:processing|registration|clearance|verification|release)\s+(?:fees?|charges?)\b|(?:रजिस्ट्रेशन|प्रोसेसिंग)\s+(?:शुल्क|फीस)|शुल्क\s+जमा\s+करें/gi,
    reason: "Asks you to pay a fee before you can receive money.",
  },

  // --- Task / part-time jobs ---
  {
    id: "task-job",
    category: "job",
    weight: 35,
    severity: "normal",
    pattern:
      /\bpart[-\s]?time\s+(?:job|work|income|opportunity)\b|\bwork\s+from\s+home\b[^.!?\n]{0,40}?\b(?:earn|income|salary)\b|\b(?:earn|income\s+of)\s+(?:rs\.?\s*|₹\s*|inr\s*)?[\d,]{1,12}\s*(?:\/-\s*)?(?:per|a|\/)\s*(?:day|hour|task)\b|\blike\s+(?:and|&)\s+(?:subscribe|earn)\b|\bliking\s+(?:youtube\s+|instagram\s+)?(?:videos?|posts?)\b|\bvideos?\s+like\s+karo\b|\bghar\s+baithe\s+(?:kamaye|kamaayein|kamao|paise|earning)\b|घर\s+बैठे[^।\n]{0,20}कमा/gi,
    reason: "Easy-money job offer: typical of task scams that later ask you to deposit money.",
  },
  {
    id: "prepaid-task",
    category: "job",
    weight: 25,
    severity: "normal",
    pattern:
      /\b(?:deposit|recharge|invest|pay)\b[^.!?\n]{0,30}?\b(?:unlock|activate|upgrade)\b[^.!?\n]{0,20}?\b(?:tasks?|premium|level|vip)\b/gi,
    reason: "Asks you to pay to unlock tasks or earnings.",
  },
  {
    id: "messaging-group",
    category: "job",
    weight: 20,
    severity: "normal",
    pattern:
      /\b(?:join|contact)\s+(?:our\s+|the\s+|us\s+on\s+|this\s+)?(?:telegram|whatsapp)\b|\b(?:telegram|whatsapp)\s+(?:group|channel)\s+join\b|\bt\.me\/\S{1,64}/gi,
    reason: "Moves you to a Telegram or WhatsApp group, where these scams usually continue.",
  },

  // --- Investment ---
  {
    id: "guaranteed-returns",
    category: "investment",
    weight: 35,
    severity: "normal",
    pattern:
      /\bguaranteed\s+(?:returns?|profits?|income)\b|\b\d{1,3}\s*%\s*(?:guaranteed\s+)?(?:daily\s+|weekly\s+|monthly\s+)?(?:returns?|profits?)\b|\brisk[-\s]?free\s+(?:investment|profits?|returns?|trading)\b|\bkoi\s+risk\s+nahi\b|\b(?:stock|trading|crypto|ipo|forex)\s+tips?\b|\bmunafa\s+pakka\b|मुनाफा\s+पक्का|गारंटीड\s+(?:रिटर्न|मुनाफा)/gi,
    reason: "Promises guaranteed or very high returns. Real investments never guarantee profit.",
  },
  {
    id: "money-doubling",
    category: "investment",
    weight: 25,
    severity: "normal",
    pattern:
      /\b(?:double|triple)\s+(?:your\s+)?(?:money|investment|amount)\b|\bmoney\s+will\s+(?:double|triple)\b|\bpaisa\s+double\b|पैसा\s+डबल|पैसे\s+डबल/gi,
    reason: "Promises to double your money.",
  },
  {
    id: "trading-group",
    category: "investment",
    weight: 20,
    severity: "normal",
    pattern:
      /\b(?:vip|premium)\s+(?:(?:stock|share|trading|investment|crypto)\s+){1,2}(?:group|channel)\b/gi,
    reason: "Invites you to a 'VIP' trading group, a common investment-scam setup.",
  },

  // --- Electricity ---
  {
    id: "electricity-disconnection",
    category: "electricity",
    weight: 35,
    severity: "normal",
    pattern:
      /\b(?:electricity|power|bijli)\b[^.!?\n]{0,60}?\b(?:disconnected|disconnect|cut\s+off|cut|stopped)\b|बिजली[^।\n]{0,40}?(?:कट|काट|बंद)|\bbijli\s+(?:kat|cut|band|kaat)\b/gi,
    reason: "Threatens to cut your electricity. Real bills don't ask you to call a mobile number.",
  },

  // --- Parcel / customs ---
  {
    id: "parcel-held",
    category: "parcel",
    weight: 30,
    severity: "normal",
    pattern:
      /\b(?:parcel|package|shipment|courier|consignment)\b[^.!?\n]{0,60}?\b(?:held|seized|stuck|on\s+hold|returned|could\s+not\s+be\s+delivered|undeliverable|detained|confiscated)\b|\b(?:fedex|dhl|blue\s?dart|india\s+post)\b[^.!?\n]{0,80}?\b(?:held|seized|customs|illegal|detained)\b|पार्सल[^।\n]{0,40}?(?:रोका|जब्त|कस्टम)/gi,
    reason: "Claims a parcel is held or seized, a common opening for courier and customs scams.",
  },
  {
    id: "address-update",
    category: "parcel",
    weight: 20,
    severity: "normal",
    pattern:
      /\b(?:update|confirm|verify|re-?enter)\s+(?:your\s+)?(?:delivery\s+|shipping\s+)?address\b|\bincomplete\s+address\b/gi,
    reason: "Asks you to 'update your address' through a link.",
  },

  // --- Remote access, links and apps ---
  {
    id: "remote-access-app",
    category: "remote_access",
    weight: 45,
    severity: "high",
    pattern:
      /\b(?:any\s?desk|team\s?viewer|quick\s?support|rust\s?desk|airdroid|alpemix|screen\s?shar(?:e|ing))\b/gi,
    reason: "Screen-sharing or remote-access apps let a scammer control your phone and bank apps.",
  },
  {
    id: "apk-link",
    category: "link",
    weight: 40,
    severity: "high",
    pattern:
      /[\w./:-]{1,200}\.apk\b|\b(?:install|download)\s+(?:this|the|our)\s+(?:apk|app\s+from\s+(?:this|the)\s+link)\b/gi,
    reason: "Asks you to install an app file from a link. These apps steal OTPs and bank data.",
  },
  {
    id: "short-link",
    category: "link",
    weight: 20,
    severity: "normal",
    pattern:
      /\b(?:bit\.ly|tinyurl\.com|t\.co|goo\.gl|is\.gd|cutt\.ly|rb\.gy|shorturl\.at|ow\.ly|tiny\.cc|rebrand\.ly|s\.id)\/\S{1,64}/gi,
    reason: "A shortened link hides where it really goes.",
  },
  {
    id: "lookalike-domain",
    category: "link",
    weight: 30,
    severity: "normal",
    // A host that names a bank or government brand AND adds a hyphen or a word like "kyc"/"verify".
    pattern:
      /\b(?:https?:\/\/)?(?=[a-z0-9.-]{0,80}(?:sbi|hdfc|icici|axis|kotak|pnb|paytm|phonepe|yono|npci|uidai|aadhaar|incometax|indiapost|epfo))(?=[a-z0-9.-]{0,80}(?:-|kyc|verify|update|secure|login|reward|support|refund|bonus|points))[a-z0-9-]{1,63}(?:\.[a-z0-9-]{1,63}){1,5}(?:\/\S{0,100})?/gi,
    reason: "The link imitates a bank or government website but is not the official address.",
  },
  {
    id: "click-link",
    category: "link",
    weight: 15,
    severity: "normal",
    pattern:
      /\b(?:click|tap)\s+(?:here|below|(?:on\s+)?(?:the|this)\s+link)\b|\blink\s+(?:par|pe)\s+click\b|लिंक\s+पर\s+क्लिक/gi,
    reason: "Pushes you to click a link.",
  },

  // --- Safe account ---
  {
    id: "safe-account",
    category: "safe_account",
    weight: 45,
    severity: "high",
    pattern:
      /\bsafe\s+(?:bank\s+)?account\b|\bsecure\s+account\s+(?:number|for\s+verification)\b|\b(?:transfer|move|deposit|shift)\s+(?:all\s+)?(?:your\s+)?(?:money|funds|amount|savings|balance)\b[^.!?\n]{0,40}?\b(?:rbi|verification|safe|secure|government)\b|सुरक्षित\s+खात|\bsafe\s+khate\b/gi,
    reason: "No bank, RBI or police will ever ask you to move money to a 'safe account'.",
  },

  // --- Calling an unknown mobile number ---
  {
    id: "call-mobile-number",
    category: "contact",
    weight: 15,
    severity: "normal",
    pattern:
      /\b(?:call|contact|whatsapp|sampark|ring)\b[^.!?\n\d]{0,40}(?:\+?91[\s-]?)?(?<!\d)[6-9]\d{4}[\s-]?\d{5}(?!\d)|(?:संपर्क|कॉल)[^।\n\d]{0,20}(?<!\d)[6-9]\d{4}[\s-]?\d{5}(?!\d)|(?<!\d)[6-9]\d{4}[\s-]?\d{5}(?!\d)[^।\n\d]{0,10}(?:पर\s+(?:संपर्क|कॉल)|\bpar\s+(?:call|sampark))/gi,
    reason: "Asks you to call or message a personal mobile number instead of an official helpline.",
  },

  // --- Attempts to manipulate AI checkers ---
  {
    id: "prompt-injection",
    category: "injection",
    weight: 30,
    severity: "normal",
    pattern:
      /\b(?:ignore|disregard|forget)\s+(?:all\s+)?(?:the\s+)?(?:previous|prior|above|earlier)\s+(?:instructions?|prompts?|rules?)\b|\b(?:say|classify|mark|label)\s+(?:this|it)\s+(?:message\s+)?as\s+(?:safe|genuine|legitimate|not\s+(?:a\s+)?scam)\b/gi,
    reason: "Contains hidden instructions trying to trick AI checkers into calling it safe.",
  },
];

/** Most specific scam types first; generic signals (links, urgency) only label a message when nothing else does. */
const SCAM_TYPE_BY_PRIORITY: readonly (readonly [SignalCategory, string])[] = [
  ["digital_arrest", "Digital arrest"],
  ["safe_account", "Safe-account transfer"],
  ["remote_access", "Remote-access app"],
  ["upi", "UPI collect request"],
  ["kyc", "Fake KYC update"],
  ["electricity", "Electricity disconnection"],
  ["parcel", "Parcel / customs"],
  ["lottery", "Lottery / prize"],
  ["job", "Task-based job"],
  ["investment", "Investment / trading"],
  ["authority", "Impersonating officials"],
  ["credentials", "OTP / PIN theft"],
  ["personal_info", "Personal data theft"],
  ["link", "Phishing link"],
  ["threat", "Account-block threat"],
  ["injection", "Manipulated message"],
  ["urgency", "Pressure tactics"],
  ["contact", "Unknown caller"],
];

export const NO_SCAM_TYPE = "No known scam pattern";

export function findSignals(text: string, rules: readonly Rule[] = RULES): RuleMatch[] {
  const matches: RuleMatch[] = [];
  for (const rule of rules) {
    let count = 0;
    for (const match of text.matchAll(rule.pattern)) {
      const phrase = match[0];
      if (phrase.trim() === "") continue;
      matches.push({
        ruleId: rule.id,
        category: rule.category,
        severity: rule.severity,
        weight: rule.weight,
        phrase,
        start: match.index,
        end: match.index + phrase.length,
        reason: rule.reason,
      });
      count += 1;
      if (count >= MAX_MATCHES_PER_RULE) break;
    }
  }
  return matches.sort((a, b) => a.start - b.start || b.end - a.end);
}

/** Sum of weights, each rule counted once however often it matches, capped at 100. */
export function scoreSignals(matches: readonly RuleMatch[]): number {
  const weightByRule = new Map<string, number>();
  for (const match of matches) weightByRule.set(match.ruleId, match.weight);
  let total = 0;
  for (const weight of weightByRule.values()) total += weight;
  return Math.min(MAX_SCORE, total);
}

export function inferScamType(matches: readonly RuleMatch[]): string {
  const categories = new Set(matches.map((match) => match.category));
  const found = SCAM_TYPE_BY_PRIORITY.find(([category]) => categories.has(category));
  return found ? found[1] : NO_SCAM_TYPE;
}

export function analyzeWithRules(text: string): RuleAnalysis {
  const matches = findSignals(text);
  return {
    score: scoreSignals(matches),
    matches,
    hasHighSeverity: matches.some((match) => match.severity === "high"),
    scamType: inferScamType(matches),
  };
}
