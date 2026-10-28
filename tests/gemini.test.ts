import { beforeEach, describe, expect, it, vi } from "vitest";

const { generateContent } = vi.hoisted(() => ({ generateContent: vi.fn() }));

vi.mock("@google/genai", async (importOriginal) => {
  const original = await importOriginal<typeof import("@google/genai")>();
  return {
    ...original,
    GoogleGenAI: class {
      models = { generateContent };
    },
  };
});

const { createGeminiAnalyzer, parseAiResponse } = await import("../src/server/ai/gemini.js");

const VALID_REPLY = JSON.stringify({
  riskScore: 88,
  scamType: "Fake KYC",
  summary: "Scam.",
  redFlags: [{ phrase: "update KYC", reason: "Fake KYC." }],
  extractedText: "",
});

interface GenerateArgs {
  contents: { parts: { text?: string; inlineData?: { mimeType: string } }[] }[];
  config: {
    responseMimeType: string;
    responseSchema: unknown;
    systemInstruction: string;
    abortSignal: AbortSignal;
  };
}

function lastCall(): GenerateArgs {
  return generateContent.mock.lastCall?.[0] as GenerateArgs;
}

const input = { text: "Update KYC now", language: "en" as const };

beforeEach(() => {
  generateContent.mockReset();
});

describe("parseAiResponse", () => {
  it("accepts a reply that matches the schema", () => {
    expect(parseAiResponse(VALID_REPLY)?.riskScore).toBe(88);
  });

  it.each([
    ["empty", undefined],
    ["not JSON", "Sure! This looks like a scam."],
    ["score out of range", JSON.stringify({ ...JSON.parse(VALID_REPLY), riskScore: 400 })],
    ["missing fields", JSON.stringify({ riskScore: 50 })],
  ])("rejects %s", (_case, raw) => {
    expect(parseAiResponse(raw)).toBeNull();
  });
});

describe("createGeminiAnalyzer", () => {
  it("asks for JSON matching a schema, with the message wrapped in boundary markers", async () => {
    generateContent.mockResolvedValue({ text: VALID_REPLY });
    const analyzer = createGeminiAnalyzer({ apiKey: "test", model: "gemini-test" });
    const result = await analyzer(input);

    expect(result?.scamType).toBe("Fake KYC");
    const { config, contents } = lastCall();
    expect(config.responseMimeType).toBe("application/json");
    expect(config.responseSchema).toBeDefined();
    const boundary = /<<<MESSAGE-([0-9a-f]+)>>>/.exec(config.systemInstruction)?.[1];
    expect(boundary).toBeDefined();
    const prompt = contents[0]?.parts[0]?.text ?? "";
    expect(prompt).toContain(`<<<MESSAGE-${String(boundary)}>>>\nUpdate KYC now\n<<<END-MESSAGE-`);
  });

  it("sends screenshots as inline data", async () => {
    generateContent.mockResolvedValue({ text: VALID_REPLY });
    const analyzer = createGeminiAnalyzer({ apiKey: "test", model: "gemini-test" });
    await analyzer({ ...input, image: { base64: "AAAA", mimeType: "image/png" } });
    expect(lastCall().contents[0]?.parts[1]?.inlineData?.mimeType).toBe("image/png");
  });

  it("retries once after an error, then succeeds", async () => {
    generateContent
      .mockRejectedValueOnce(new Error("503"))
      .mockResolvedValueOnce({ text: VALID_REPLY });
    const analyzer = createGeminiAnalyzer({ apiKey: "test", model: "gemini-test" });
    expect(await analyzer(input)).not.toBeNull();
    expect(generateContent).toHaveBeenCalledTimes(2);
  });

  it("gives up after one retry and returns null (rules-only fallback)", async () => {
    generateContent.mockResolvedValue({ text: "not json" });
    const analyzer = createGeminiAnalyzer({ apiKey: "test", model: "gemini-test" });
    expect(await analyzer(input)).toBeNull();
    expect(generateContent).toHaveBeenCalledTimes(2);
  });

  it("aborts a hanging call at the timeout instead of hanging the request", async () => {
    generateContent.mockImplementation(
      ({ config }: GenerateArgs) =>
        new Promise((_resolve, reject) => {
          config.abortSignal.addEventListener("abort", () => {
            reject(Object.assign(new Error("aborted"), { name: "AbortError" }));
          });
        }),
    );
    const analyzer = createGeminiAnalyzer({ apiKey: "test", model: "gemini-test", timeoutMs: 50 });
    const startedAt = Date.now();
    expect(await analyzer(input)).toBeNull();
    expect(Date.now() - startedAt).toBeLessThan(1000);
    expect(generateContent).toHaveBeenCalledTimes(1);
  });
});
