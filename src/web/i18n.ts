import type { LanguageCode } from "../shared/languages.js";

export interface UiStrings {
  tagline: string;
  badgeHybrid: string;
  badgeLanguages: string;
  badgeNoStorage: string;
  skipToContent: string;
  largeText: string;
  languageLabel: string;
  inputHeading: string;
  tabPaste: string;
  tabUpload: string;
  messageLabel: string;
  messagePlaceholder: string;
  uploadPrompt: string;
  uploadHint: string;
  removeImage: string;
  screenshotAlt: string;
  examplesLabel: string;
  exampleDigitalArrest: string;
  exampleKyc: string;
  exampleGenuine: string;
  check: string;
  checking: string;
  resultHeading: string;
  verdict_scam: string;
  verdict_suspicious: string;
  verdict_safe: string;
  riskScore: string;
  scamTypeLabel: string;
  highlightedHeading: string;
  redFlagMark: string;
  redFlagsHeading: string;
  noRedFlags: string;
  foundByRules: string;
  foundByAi: string;
  aiOff: string;
  extractedTextLabel: string;
  whatHappened: string;
  situation_received: string;
  situation_clicked: string;
  situation_paid: string;
  nextSteps: string;
  readAloud: string;
  stopReading: string;
  share: string;
  shareCopied: string;
  checkAnother: string;
  helplineQuestion: string;
  helplineCall: string;
  privacy: string;
  officialHelp: string;
  error_generic: string;
  error_rateLimit: string;
  error_image: string;
  error_empty: string;
  error_imageType: string;
  error_imageSize: string;
  sharePrefix: string;
  shareFooter: string;
}

const en: UiStrings = {
  tagline: "Check any message before you trust it",
  badgeHybrid: "Rules + Gemini AI",
  badgeLanguages: "8 Indian languages",
  badgeNoStorage: "Nothing stored",
  skipToContent: "Skip to the message checker",
  largeText: "Larger text",
  languageLabel: "Language",
  inputHeading: "Check a message",
  tabPaste: "Paste message",
  tabUpload: "Upload screenshot",
  messageLabel: "Paste the message you received",
  messagePlaceholder: "For example: Your account will be blocked today. Update KYC now…",
  uploadPrompt: "Choose a screenshot, or drag and drop it here",
  uploadHint: "PNG, JPG or WebP, up to 4 MB",
  removeImage: "Remove screenshot",
  screenshotAlt: "Your screenshot",
  examplesLabel: "Try an example",
  exampleDigitalArrest: "Digital arrest",
  exampleKyc: "Fake KYC",
  exampleGenuine: "Genuine bank OTP",
  check: "Check message",
  checking: "Checking…",
  resultHeading: "Result",
  verdict_scam: "Scam",
  verdict_suspicious: "Suspicious",
  verdict_safe: "Looks safe",
  riskScore: "Risk score",
  scamTypeLabel: "Type",
  highlightedHeading: "Warning signs in the message",
  redFlagMark: "warning sign",
  redFlagsHeading: "Why we think so",
  noRedFlags: "We found no warning signs.",
  foundByRules: "Found by rules",
  foundByAi: "Found by AI",
  aiOff: "The AI check is unavailable right now, so this result comes from our rule engine only.",
  extractedTextLabel: "Text we read from your screenshot",
  whatHappened: "What happened?",
  situation_received: "I only received it",
  situation_clicked: "I clicked a link or shared details",
  situation_paid: "I already sent money",
  nextSteps: "What to do now",
  readAloud: "Read aloud",
  stopReading: "Stop reading",
  share: "Share warning with family",
  shareCopied: "Warning copied. Paste it into WhatsApp or SMS.",
  checkAnother: "Check another message",
  helplineQuestion: "Already paid?",
  helplineCall: "Call 1930 now",
  privacy: "We don't store your messages. Personal numbers are hidden before any AI check.",
  officialHelp: "Official help",
  error_generic: "Something went wrong. Please try again in a moment.",
  error_rateLimit: "Too many checks right now. Please wait a minute and try again.",
  error_image: "We couldn't read this screenshot. Please paste the message text instead.",
  error_empty: "Please paste a message or choose a screenshot first.",
  error_imageType: "Please choose a PNG, JPG or WebP image.",
  error_imageSize: "This image is too large. Please choose one under 4 MB.",
  sharePrefix: "Satark warning",
  shareFooter: "Never share an OTP or PIN. If you lost money, call 1930.",
};

const hi: UiStrings = {
  tagline: "किसी भी संदेश पर भरोसा करने से पहले जांचें",
  badgeHybrid: "नियम + Gemini AI",
  badgeLanguages: "8 भारतीय भाषाएं",
  badgeNoStorage: "कुछ भी सेव नहीं होता",
  skipToContent: "संदेश जांच पर जाएं",
  largeText: "बड़े अक्षर",
  languageLabel: "भाषा",
  inputHeading: "संदेश जांचें",
  tabPaste: "संदेश चिपकाएं",
  tabUpload: "स्क्रीनशॉट अपलोड करें",
  messageLabel: "आपको मिला संदेश यहां चिपकाएं",
  messagePlaceholder: "उदाहरण: आपका खाता आज बंद हो जाएगा। अभी KYC अपडेट करें…",
  uploadPrompt: "स्क्रीनशॉट चुनें, या उसे यहां खींचकर छोड़ें",
  uploadHint: "PNG, JPG या WebP, 4 MB तक",
  removeImage: "स्क्रीनशॉट हटाएं",
  screenshotAlt: "आपका स्क्रीनशॉट",
  examplesLabel: "उदाहरण आज़माएं",
  exampleDigitalArrest: "डिजिटल अरेस्ट",
  exampleKyc: "नकली KYC",
  exampleGenuine: "असली बैंक OTP",
  check: "संदेश जांचें",
  checking: "जांच हो रही है…",
  resultHeading: "नतीजा",
  verdict_scam: "धोखा",
  verdict_suspicious: "संदिग्ध",
  verdict_safe: "सुरक्षित लगता है",
  riskScore: "जोखिम स्कोर",
  scamTypeLabel: "प्रकार",
  highlightedHeading: "संदेश में चेतावनी के संकेत",
  redFlagMark: "चेतावनी संकेत",
  redFlagsHeading: "हम ऐसा क्यों मानते हैं",
  noRedFlags: "हमें कोई चेतावनी संकेत नहीं मिला।",
  foundByRules: "नियमों से मिला",
  foundByAi: "AI से मिला",
  aiOff: "AI जांच अभी उपलब्ध नहीं है, इसलिए यह नतीजा सिर्फ़ हमारे नियमों पर आधारित है।",
  extractedTextLabel: "आपके स्क्रीनशॉट से पढ़ा गया संदेश",
  whatHappened: "क्या हुआ?",
  situation_received: "मुझे सिर्फ़ संदेश मिला",
  situation_clicked: "मैंने लिंक खोला या जानकारी दी",
  situation_paid: "मैंने पैसे भेज दिए",
  nextSteps: "अब क्या करें",
  readAloud: "पढ़कर सुनाएं",
  stopReading: "सुनाना बंद करें",
  share: "परिवार को चेतावनी भेजें",
  shareCopied: "चेतावनी कॉपी हो गई। इसे WhatsApp या SMS में चिपकाएं।",
  checkAnother: "दूसरा संदेश जांचें",
  helplineQuestion: "पैसे भेज चुके हैं?",
  helplineCall: "अभी 1930 पर कॉल करें",
  privacy: "हम आपके संदेश सेव नहीं करते। AI जांच से पहले निजी नंबर छिपा दिए जाते हैं।",
  officialHelp: "आधिकारिक मदद",
  error_generic: "कुछ गड़बड़ हो गई। कृपया थोड़ी देर में फिर कोशिश करें।",
  error_rateLimit: "अभी बहुत ज़्यादा जांचें हो रही हैं। एक मिनट रुककर फिर कोशिश करें।",
  error_image: "हम यह स्क्रीनशॉट नहीं पढ़ पाए। कृपया संदेश का टेक्स्ट चिपकाएं।",
  error_empty: "पहले कोई संदेश चिपकाएं या स्क्रीनशॉट चुनें।",
  error_imageType: "कृपया PNG, JPG या WebP फ़ोटो चुनें।",
  error_imageSize: "यह फ़ोटो बहुत बड़ी है। कृपया 4 MB से छोटी फ़ोटो चुनें।",
  sharePrefix: "सतर्क चेतावनी",
  shareFooter: "कभी भी OTP या PIN न बताएं। पैसे गए हों तो 1930 पर कॉल करें।",
};

const mr: UiStrings = {
  tagline: "कोणत्याही संदेशावर विश्वास ठेवण्यापूर्वी तपासा",
  badgeHybrid: "नियम + Gemini AI",
  badgeLanguages: "8 भारतीय भाषा",
  badgeNoStorage: "काहीही साठवले जात नाही",
  skipToContent: "संदेश तपासणीकडे जा",
  largeText: "मोठी अक्षरे",
  languageLabel: "भाषा",
  inputHeading: "संदेश तपासा",
  tabPaste: "संदेश पेस्ट करा",
  tabUpload: "स्क्रीनशॉट अपलोड करा",
  messageLabel: "तुम्हाला आलेला संदेश इथे पेस्ट करा",
  messagePlaceholder: "उदा.: तुमचे खाते आज बंद होईल. आत्ताच KYC अपडेट करा…",
  uploadPrompt: "स्क्रीनशॉट निवडा, किंवा तो इथे ओढून सोडा",
  uploadHint: "PNG, JPG किंवा WebP, 4 MB पर्यंत",
  removeImage: "स्क्रीनशॉट काढा",
  screenshotAlt: "तुमचा स्क्रीनशॉट",
  examplesLabel: "उदाहरण वापरून पाहा",
  exampleDigitalArrest: "डिजिटल अरेस्ट",
  exampleKyc: "बनावट KYC",
  exampleGenuine: "खरा बँक OTP",
  check: "संदेश तपासा",
  checking: "तपासत आहे…",
  resultHeading: "निकाल",
  verdict_scam: "फसवणूक",
  verdict_suspicious: "संशयास्पद",
  verdict_safe: "सुरक्षित वाटतो",
  riskScore: "धोका गुण",
  scamTypeLabel: "प्रकार",
  highlightedHeading: "संदेशातील धोक्याची चिन्हे",
  redFlagMark: "धोक्याचे चिन्ह",
  redFlagsHeading: "आम्हाला असे का वाटते",
  noRedFlags: "आम्हाला कोणतेही धोक्याचे चिन्ह आढळले नाही.",
  foundByRules: "नियमांनी शोधले",
  foundByAi: "AI ने शोधले",
  aiOff: "AI तपासणी सध्या उपलब्ध नाही, त्यामुळे हा निकाल फक्त आमच्या नियमांवर आधारित आहे.",
  extractedTextLabel: "तुमच्या स्क्रीनशॉटमधून वाचलेला मजकूर",
  whatHappened: "काय झाले?",
  situation_received: "मला फक्त संदेश आला",
  situation_clicked: "मी लिंक उघडली किंवा माहिती दिली",
  situation_paid: "मी पैसे पाठवले",
  nextSteps: "आता काय करावे",
  readAloud: "वाचून दाखवा",
  stopReading: "वाचन थांबवा",
  share: "कुटुंबाला सावध करा",
  shareCopied: "इशारा कॉपी झाला. तो WhatsApp किंवा SMS मध्ये पेस्ट करा.",
  checkAnother: "दुसरा संदेश तपासा",
  helplineQuestion: "पैसे गेले आहेत?",
  helplineCall: "आत्ताच 1930 वर कॉल करा",
  privacy: "आम्ही तुमचे संदेश साठवत नाही. AI तपासणीपूर्वी वैयक्तिक नंबर लपवले जातात.",
  officialHelp: "अधिकृत मदत",
  error_generic: "काहीतरी चुकले. कृपया थोड्या वेळाने पुन्हा प्रयत्न करा.",
  error_rateLimit: "सध्या खूप तपासण्या होत आहेत. एक मिनिट थांबून पुन्हा प्रयत्न करा.",
  error_image: "हा स्क्रीनशॉट वाचता आला नाही. कृपया संदेशाचा मजकूर पेस्ट करा.",
  error_empty: "आधी संदेश पेस्ट करा किंवा स्क्रीनशॉट निवडा.",
  error_imageType: "कृपया PNG, JPG किंवा WebP फोटो निवडा.",
  error_imageSize: "हा फोटो खूप मोठा आहे. कृपया 4 MB पेक्षा लहान फोटो निवडा.",
  sharePrefix: "सतर्क इशारा",
  shareFooter: "कधीही OTP किंवा PIN सांगू नका. पैसे गेले असल्यास 1930 वर कॉल करा.",
};

/** Result-card strings for the remaining languages; anything missing falls back to English. */
const partial: Partial<Record<LanguageCode, Partial<UiStrings>>> = {
  ta: {
    check: "செய்தியைச் சரிபார்க்கவும்",
    checking: "சரிபார்க்கிறது…",
    verdict_scam: "மோசடி",
    verdict_suspicious: "சந்தேகமானது",
    verdict_safe: "பாதுகாப்பானதாகத் தெரிகிறது",
    riskScore: "ஆபத்து மதிப்பெண்",
    redFlagsHeading: "நாங்கள் ஏன் இப்படி நினைக்கிறோம்",
    foundByRules: "விதிகள் கண்டறிந்தது",
    foundByAi: "AI கண்டறிந்தது",
    whatHappened: "என்ன நடந்தது?",
    situation_received: "எனக்கு செய்தி மட்டுமே வந்தது",
    situation_clicked: "நான் இணைப்பைத் திறந்தேன் அல்லது விவரங்களைப் பகிர்ந்தேன்",
    situation_paid: "நான் ஏற்கனவே பணம் அனுப்பிவிட்டேன்",
    nextSteps: "இப்போது என்ன செய்வது",
    readAloud: "உரக்கப் படிக்கவும்",
    stopReading: "படிப்பதை நிறுத்து",
    share: "குடும்பத்தினருக்கு எச்சரிக்கை அனுப்பவும்",
    checkAnother: "வேறு செய்தியைச் சரிபார்க்கவும்",
    helplineQuestion: "ஏற்கனவே பணம் செலுத்திவிட்டீர்களா?",
    helplineCall: "இப்போதே 1930-ஐ அழையுங்கள்",
    shareFooter: "OTP அல்லது PIN-ஐ ஒருபோதும் பகிராதீர்கள். பணம் இழந்தால் 1930-ஐ அழையுங்கள்.",
  },
  te: {
    check: "సందేశాన్ని తనిఖీ చేయండి",
    checking: "తనిఖీ చేస్తోంది…",
    verdict_scam: "మోసం",
    verdict_suspicious: "అనుమానాస్పదం",
    verdict_safe: "సురక్షితంగా కనిపిస్తోంది",
    riskScore: "ప్రమాద స్కోర్",
    redFlagsHeading: "మేము ఎందుకు ఇలా భావిస్తున్నాం",
    foundByRules: "నియమాలు గుర్తించాయి",
    foundByAi: "AI గుర్తించింది",
    whatHappened: "ఏమి జరిగింది?",
    situation_received: "నాకు సందేశం మాత్రమే వచ్చింది",
    situation_clicked: "నేను లింక్ తెరిచాను లేదా వివరాలు ఇచ్చాను",
    situation_paid: "నేను ఇప్పటికే డబ్బు పంపాను",
    nextSteps: "ఇప్పుడు ఏమి చేయాలి",
    readAloud: "చదివి వినిపించు",
    stopReading: "చదవడం ఆపు",
    share: "కుటుంబానికి హెచ్చరిక పంపండి",
    checkAnother: "మరో సందేశాన్ని తనిఖీ చేయండి",
    helplineQuestion: "ఇప్పటికే డబ్బు చెల్లించారా?",
    helplineCall: "ఇప్పుడే 1930కు కాల్ చేయండి",
    shareFooter: "OTP లేదా PIN ఎవరికీ చెప్పకండి. డబ్బు పోతే 1930కు కాల్ చేయండి.",
  },
  bn: {
    check: "বার্তা যাচাই করুন",
    checking: "যাচাই করা হচ্ছে…",
    verdict_scam: "প্রতারণা",
    verdict_suspicious: "সন্দেহজনক",
    verdict_safe: "নিরাপদ মনে হচ্ছে",
    riskScore: "ঝুঁকি স্কোর",
    redFlagsHeading: "আমরা কেন এমন মনে করছি",
    foundByRules: "নিয়ম দিয়ে পাওয়া",
    foundByAi: "AI দিয়ে পাওয়া",
    whatHappened: "কী হয়েছে?",
    situation_received: "আমি শুধু বার্তাটি পেয়েছি",
    situation_clicked: "আমি লিঙ্ক খুলেছি বা তথ্য দিয়েছি",
    situation_paid: "আমি ইতিমধ্যে টাকা পাঠিয়েছি",
    nextSteps: "এখন কী করবেন",
    readAloud: "পড়ে শোনান",
    stopReading: "পড়া বন্ধ করুন",
    share: "পরিবারকে সতর্ক করুন",
    checkAnother: "আরেকটি বার্তা যাচাই করুন",
    helplineQuestion: "ইতিমধ্যে টাকা দিয়েছেন?",
    helplineCall: "এখনই 1930-এ কল করুন",
    shareFooter: "কখনো OTP বা PIN বলবেন না। টাকা হারালে 1930-এ কল করুন।",
  },
  gu: {
    check: "સંદેશ તપાસો",
    checking: "તપાસ ચાલુ છે…",
    verdict_scam: "છેતરપિંડી",
    verdict_suspicious: "શંકાસ્પદ",
    verdict_safe: "સુરક્ષિત લાગે છે",
    riskScore: "જોખમ સ્કોર",
    redFlagsHeading: "અમે આવું કેમ માનીએ છીએ",
    foundByRules: "નિયમોથી મળ્યું",
    foundByAi: "AI થી મળ્યું",
    whatHappened: "શું થયું?",
    situation_received: "મને ફક્ત સંદેશ મળ્યો",
    situation_clicked: "મેં લિંક ખોલી કે માહિતી આપી",
    situation_paid: "મેં પૈસા મોકલી દીધા",
    nextSteps: "હવે શું કરવું",
    readAloud: "વાંચીને સંભળાવો",
    stopReading: "વાંચવાનું બંધ કરો",
    share: "પરિવારને ચેતવણી મોકલો",
    checkAnother: "બીજો સંદેશ તપાસો",
    helplineQuestion: "પૈસા ચૂકવી દીધા છે?",
    helplineCall: "હમણાં જ 1930 પર કૉલ કરો",
    shareFooter: "ક્યારેય OTP કે PIN ન કહો. પૈસા ગયા હોય તો 1930 પર કૉલ કરો.",
  },
  kn: {
    check: "ಸಂದೇಶ ಪರಿಶೀಲಿಸಿ",
    checking: "ಪರಿಶೀಲಿಸಲಾಗುತ್ತಿದೆ…",
    verdict_scam: "ವಂಚನೆ",
    verdict_suspicious: "ಸಂಶಯಾಸ್ಪದ",
    verdict_safe: "ಸುರಕ್ಷಿತವೆಂದು ತೋರುತ್ತದೆ",
    riskScore: "ಅಪಾಯದ ಅಂಕ",
    redFlagsHeading: "ನಾವು ಹೀಗೆ ಏಕೆ ಭಾವಿಸುತ್ತೇವೆ",
    foundByRules: "ನಿಯಮಗಳು ಪತ್ತೆಹಚ್ಚಿವೆ",
    foundByAi: "AI ಪತ್ತೆಹಚ್ಚಿದೆ",
    whatHappened: "ಏನಾಯಿತು?",
    situation_received: "ನನಗೆ ಸಂದೇಶ ಮಾತ್ರ ಬಂದಿದೆ",
    situation_clicked: "ನಾನು ಲಿಂಕ್ ತೆರೆದೆ ಅಥವಾ ವಿವರ ಹಂಚಿಕೊಂಡೆ",
    situation_paid: "ನಾನು ಈಗಾಗಲೇ ಹಣ ಕಳುಹಿಸಿದ್ದೇನೆ",
    nextSteps: "ಈಗ ಏನು ಮಾಡಬೇಕು",
    readAloud: "ಓದಿ ಹೇಳಿ",
    stopReading: "ಓದುವುದನ್ನು ನಿಲ್ಲಿಸಿ",
    share: "ಕುಟುಂಬಕ್ಕೆ ಎಚ್ಚರಿಕೆ ಕಳುಹಿಸಿ",
    checkAnother: "ಮತ್ತೊಂದು ಸಂದೇಶ ಪರಿಶೀಲಿಸಿ",
    helplineQuestion: "ಈಗಾಗಲೇ ಹಣ ಪಾವತಿಸಿದ್ದೀರಾ?",
    helplineCall: "ಈಗಲೇ 1930ಕ್ಕೆ ಕರೆ ಮಾಡಿ",
    shareFooter: "OTP ಅಥವಾ PIN ಅನ್ನು ಎಂದಿಗೂ ಹಂಚಿಕೊಳ್ಳಬೇಡಿ. ಹಣ ಕಳೆದುಕೊಂಡರೆ 1930ಕ್ಕೆ ಕರೆ ಮಾಡಿ.",
  },
};

const COMPLETE: Partial<Record<LanguageCode, UiStrings>> = { en, hi, mr };

export function getStrings(language: LanguageCode): UiStrings {
  return COMPLETE[language] ?? { ...en, ...partial[language] };
}
