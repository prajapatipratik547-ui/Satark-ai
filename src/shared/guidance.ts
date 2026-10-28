import type { LanguageCode } from "./languages.js";
import { PLAYBOOKS, type Situation } from "./resources.js";
import type { Verdict } from "./types.js";

/** Translations of playbook steps, keyed by step id. English comes from resources.ts. */
export const PLAYBOOK_TRANSLATIONS: Partial<
  Record<LanguageCode, Readonly<Record<string, string>>>
> = {};

/** Used when the AI is unavailable or disagrees with the rule engine. */
export const FALLBACK_SUMMARIES: Readonly<Record<LanguageCode, Readonly<Record<Verdict, string>>>> =
  {
    en: {
      scam: "This message shows strong signs of a scam. Do not reply, click links or share any details.",
      suspicious:
        "This message has warning signs of a scam. Be careful and check with someone you trust.",
      safe: "We found no known scam signs in this message. Still, never share an OTP or PIN with anyone.",
    },
    hi: {
      scam: "इस संदेश में धोखाधड़ी के पक्के संकेत हैं। जवाब न दें, लिंक न खोलें और कोई जानकारी साझा न करें।",
      suspicious:
        "इस संदेश में धोखाधड़ी के चेतावनी संकेत हैं। सावधान रहें और किसी भरोसेमंद व्यक्ति से पूछें।",
      safe: "इस संदेश में धोखाधड़ी का कोई ज्ञात संकेत नहीं मिला। फिर भी अपना OTP या PIN कभी किसी को न बताएं।",
    },
    mr: {
      scam: "या संदेशात फसवणुकीची ठळक चिन्हे आहेत. उत्तर देऊ नका, लिंक उघडू नका आणि कोणतीही माहिती देऊ नका.",
      suspicious:
        "या संदेशात फसवणुकीची धोक्याची चिन्हे आहेत. सावध राहा आणि विश्वासू व्यक्तीला विचारा.",
      safe: "या संदेशात फसवणुकीचे कोणतेही ज्ञात चिन्ह आढळले नाही. तरीही तुमचा OTP किंवा PIN कोणालाही सांगू नका.",
    },
    ta: {
      scam: "இந்தச் செய்தியில் மோசடியின் வலுவான அறிகுறிகள் உள்ளன. பதில் அளிக்காதீர்கள், இணைப்புகளைத் திறக்காதீர்கள், எந்த விவரத்தையும் பகிராதீர்கள்.",
      suspicious:
        "இந்தச் செய்தியில் மோசடியின் எச்சரிக்கை அறிகுறிகள் உள்ளன. கவனமாக இருங்கள், நம்பிக்கையான ஒருவரிடம் கேளுங்கள்.",
      safe: "இந்தச் செய்தியில் அறியப்பட்ட மோசடி அறிகுறிகள் இல்லை. இருந்தாலும் OTP அல்லது PIN-ஐ யாரிடமும் பகிராதீர்கள்.",
    },
    te: {
      scam: "ఈ సందేశంలో మోసానికి బలమైన సంకేతాలు ఉన్నాయి. జవాబు ఇవ్వకండి, లింక్‌లు తెరవకండి, ఏ వివరాలూ పంచుకోకండి.",
      suspicious:
        "ఈ సందేశంలో మోసానికి హెచ్చరిక సంకేతాలు ఉన్నాయి. జాగ్రత్తగా ఉండండి, నమ్మకమైన వారిని అడగండి.",
      safe: "ఈ సందేశంలో తెలిసిన మోసం సంకేతాలు కనిపించలేదు. అయినా మీ OTP లేదా PIN ఎవరికీ చెప్పకండి.",
    },
    bn: {
      scam: "এই বার্তায় প্রতারণার স্পষ্ট লক্ষণ আছে। উত্তর দেবেন না, লিঙ্ক খুলবেন না এবং কোনো তথ্য দেবেন না।",
      suspicious:
        "এই বার্তায় প্রতারণার সতর্কতা লক্ষণ আছে। সাবধান থাকুন এবং বিশ্বস্ত কাউকে জিজ্ঞাসা করুন।",
      safe: "এই বার্তায় প্রতারণার কোনো পরিচিত লক্ষণ পাওয়া যায়নি। তবুও আপনার OTP বা PIN কাউকে বলবেন না।",
    },
    gu: {
      scam: "આ સંદેશમાં છેતરપિંડીના સ્પષ્ટ સંકેતો છે. જવાબ ન આપો, લિંક ન ખોલો અને કોઈ માહિતી શેર ન કરો.",
      suspicious:
        "આ સંદેશમાં છેતરપિંડીના ચેતવણી સંકેતો છે. સાવચેત રહો અને વિશ્વાસુ વ્યક્તિને પૂછો.",
      safe: "આ સંદેશમાં છેતરપિંડીનો કોઈ જાણીતો સંકેત મળ્યો નથી. તેમ છતાં તમારો OTP કે PIN કોઈને ન કહો.",
    },
    kn: {
      scam: "ಈ ಸಂದೇಶದಲ್ಲಿ ವಂಚನೆಯ ಬಲವಾದ ಲಕ್ಷಣಗಳಿವೆ. ಉತ್ತರಿಸಬೇಡಿ, ಲಿಂಕ್ ತೆರೆಯಬೇಡಿ ಮತ್ತು ಯಾವುದೇ ಮಾಹಿತಿ ಹಂಚಿಕೊಳ್ಳಬೇಡಿ.",
      suspicious:
        "ಈ ಸಂದೇಶದಲ್ಲಿ ವಂಚನೆಯ ಎಚ್ಚರಿಕೆಯ ಲಕ್ಷಣಗಳಿವೆ. ಜಾಗರೂಕರಾಗಿರಿ ಮತ್ತು ನಂಬಿಕಸ್ಥರನ್ನು ಕೇಳಿ.",
      safe: "ಈ ಸಂದೇಶದಲ್ಲಿ ತಿಳಿದಿರುವ ವಂಚನೆಯ ಲಕ್ಷಣಗಳು ಕಂಡುಬಂದಿಲ್ಲ. ಆದರೂ ನಿಮ್ಮ OTP ಅಥವಾ PIN ಅನ್ನು ಯಾರಿಗೂ ಹೇಳಬೇಡಿ.",
    },
  };

export function playbookTexts(situation: Situation, language: LanguageCode): string[] {
  const translations = PLAYBOOK_TRANSLATIONS[language];
  return PLAYBOOKS[situation].map((step) => translations?.[step.id] ?? step.text);
}

export function fallbackSummary(verdict: Verdict, language: LanguageCode): string {
  return FALLBACK_SUMMARIES[language][verdict];
}
