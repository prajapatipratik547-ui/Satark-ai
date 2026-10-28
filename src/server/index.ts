import { createGeminiAnalyzer } from "./ai/gemini.js";
import { createApp } from "./app.js";

const port = Number(process.env.PORT ?? 8080);
const apiKey = process.env.GEMINI_API_KEY;
const model = process.env.GEMINI_MODEL ?? "gemini-2.5-flash";

if (!apiKey) console.warn("GEMINI_API_KEY is not set: running with the rule engine only.");
const analyzer = apiKey ? createGeminiAnalyzer({ apiKey, model }) : null;

const server = createApp({ analyzer }).listen(port, () => {
  console.log(`Satark listening on port ${String(port)} (AI ${analyzer ? model : "off"})`);
});

// Cloud Run sends SIGTERM before stopping an instance; let in-flight requests finish.
process.on("SIGTERM", () => {
  server.close(() => process.exit(0));
});
