import type { LanguageCode } from "../../shared/languages.js";

/** Hindi reasons for each rule id; other languages fall back to the English reason in rules.ts. */
const RULE_REASONS_HI: Readonly<Record<string, string>> = {
  "urgency-deadline": "जल्दबाज़ी का दबाव बनाता है ताकि आप बिना सोचे कदम उठाएं।",
  "account-block-threat": "डराने के लिए आपका खाता या सेवा बंद करने की धमकी देता है।",
  "credential-request": "आपका OTP, PIN, CVV या पासवर्ड मांगता है। बैंक ये कभी नहीं मांगते।",
  "credential-request-hindi": "आपसे OTP या PIN बताने या भेजने को कहता है। बैंक ये कभी नहीं मांगते।",
  "personal-info-request": "आधार, PAN, कार्ड या बैंक की जानकारी मांगता है।",
  "kyc-update": "नकली KYC अपडेट। बैंक संदेश के लिंक से KYC अपडेट करने को नहीं कहते।",
  "digital-arrest":
    "भारतीय कानून में “डिजिटल अरेस्ट” जैसी कोई चीज़ नहीं है। पुलिस कॉल पर किसी को गिरफ्तार नहीं करती।",
  "legal-threat": "आपको डराकर पैसे वसूलने के लिए गिरफ्तारी या केस की धमकी देता है।",
  "isolation-tactic": "आपको अकेला रखने की कोशिश करता है ताकि कोई आपको सावधान न कर सके।",
  "authority-impersonation":
    "खुद को पुलिस, CBI, कस्टम या सरकारी अधिकारी बताता है। वे इस तरह संपर्क नहीं करते।",
  "upi-pin-to-receive":
    "पैसे पाने के लिए UPI PIN कभी नहीं डालना पड़ता। PIN सिर्फ़ पैसे भेजने के लिए होता है।",
  "upi-collect-request":
    "UPI कलेक्ट रिक्वेस्ट आपसे पैसे लेती है। इसे मंज़ूर करना भुगतान करना है, पैसा पाना नहीं।",
  "lottery-prize": "ऐसी लॉटरी या इनाम का वादा करता है जिसमें आपने कभी हिस्सा ही नहीं लिया।",
  "advance-fee": "पैसे पाने से पहले फ़ीस भरने को कहता है।",
  "task-job": "आसान कमाई वाली नौकरी का ऑफ़र। ऐसे टास्क स्कैम बाद में पैसे जमा करवाते हैं।",
  "prepaid-task": "टास्क या कमाई खोलने के लिए पैसे भरने को कहता है।",
  "messaging-group": "आपको Telegram या WhatsApp ग्रुप में ले जाता है, जहां ठगी आगे बढ़ती है।",
  "guaranteed-returns":
    "पक्के या बहुत ज़्यादा मुनाफ़े का वादा करता है। असली निवेश में मुनाफ़े की गारंटी नहीं होती।",
  "money-doubling": "पैसा दोगुना करने का वादा करता है।",
  "trading-group": "‘VIP’ ट्रेडिंग ग्रुप में बुलाता है, जो निवेश ठगी का आम तरीका है।",
  "electricity-disconnection":
    "बिजली काटने की धमकी देता है। असली बिल मोबाइल नंबर पर कॉल करने को नहीं कहते।",
  "parcel-held":
    "पार्सल रोके या ज़ब्त होने की बात करता है, जो कूरियर और कस्टम ठगी की आम शुरुआत है।",
  "address-update": "लिंक से ‘पता अपडेट’ करने को कहता है।",
  "remote-access-app": "स्क्रीन शेयर या रिमोट ऐप से ठग आपके फ़ोन और बैंक ऐप पर कब्ज़ा कर सकता है।",
  "apk-link": "लिंक से ऐप फ़ाइल इंस्टॉल करने को कहता है। ऐसे ऐप OTP और बैंक जानकारी चुराते हैं।",
  "short-link": "छोटा किया गया लिंक असली पता छिपाता है।",
  "lookalike-domain": "लिंक बैंक या सरकारी वेबसाइट जैसा दिखता है, पर असली पता नहीं है।",
  "click-link": "लिंक पर क्लिक करने का दबाव डालता है।",
  "safe-account": "कोई बैंक, RBI या पुलिस कभी पैसे ‘सुरक्षित खाते’ में डालने को नहीं कहती।",
  "call-mobile-number": "आधिकारिक हेल्पलाइन के बजाय किसी निजी मोबाइल नंबर पर कॉल करने को कहता है।",
  "prompt-injection":
    "इसमें छिपे निर्देश हैं जो AI जांच को धोखा देकर इसे सुरक्षित बताने की कोशिश करते हैं।",
};

const RULE_REASONS: Partial<Record<LanguageCode, Readonly<Record<string, string>>>> = {
  hi: RULE_REASONS_HI,
};

export function localizedRuleReason(
  ruleId: string,
  englishReason: string,
  language: LanguageCode,
): string {
  return RULE_REASONS[language]?.[ruleId] ?? englishReason;
}

export const TRANSLATED_RULE_IDS = Object.keys(RULE_REASONS_HI);
