/** Read-aloud via the Web Speech API. Every function is a safe no-op where speech is unsupported. */

export function isSpeechSupported(): boolean {
  return typeof window !== "undefined" && "speechSynthesis" in window;
}

function pickVoice(speechLang: string): SpeechSynthesisVoice | undefined {
  const voices = window.speechSynthesis.getVoices();
  const base = speechLang.split("-")[0] ?? speechLang;
  return (
    voices.find((voice) => voice.lang === speechLang) ??
    voices.find((voice) => voice.lang.startsWith(base))
  );
}

export function speak(text: string, speechLang: string, onEnd: () => void): void {
  if (!isSpeechSupported()) return;
  window.speechSynthesis.cancel();
  const utterance = new SpeechSynthesisUtterance(text);
  utterance.lang = speechLang;
  const voice = pickVoice(speechLang);
  if (voice) utterance.voice = voice;
  utterance.rate = 0.9;
  utterance.onend = onEnd;
  utterance.onerror = onEnd;
  window.speechSynthesis.speak(utterance);
}

export function stopSpeaking(): void {
  if (isSpeechSupported()) window.speechSynthesis.cancel();
}
