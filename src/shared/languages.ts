export const LANGUAGE_CODES = ["en", "hi", "mr", "ta", "te", "bn", "gu", "kn"] as const;

export type LanguageCode = (typeof LANGUAGE_CODES)[number];

export interface Language {
  code: LanguageCode;
  englishName: string;
  nativeName: string;
  /** BCP-47 tag used to pick a Web Speech voice. */
  speechLang: string;
}

export const LANGUAGES: Readonly<Record<LanguageCode, Language>> = {
  en: { code: "en", englishName: "English", nativeName: "English", speechLang: "en-IN" },
  hi: { code: "hi", englishName: "Hindi", nativeName: "हिंदी", speechLang: "hi-IN" },
  mr: { code: "mr", englishName: "Marathi", nativeName: "मराठी", speechLang: "mr-IN" },
  ta: { code: "ta", englishName: "Tamil", nativeName: "தமிழ்", speechLang: "ta-IN" },
  te: { code: "te", englishName: "Telugu", nativeName: "తెలుగు", speechLang: "te-IN" },
  bn: { code: "bn", englishName: "Bengali", nativeName: "বাংলা", speechLang: "bn-IN" },
  gu: { code: "gu", englishName: "Gujarati", nativeName: "ગુજરાતી", speechLang: "gu-IN" },
  kn: { code: "kn", englishName: "Kannada", nativeName: "ಕನ್ನಡ", speechLang: "kn-IN" },
};
