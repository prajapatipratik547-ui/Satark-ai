// @vitest-environment jsdom
import { cleanup, render, screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { axe } from "vitest-axe";
import type { AnalysisResult } from "../src/shared/types.js";
import { App } from "../src/web/App.js";

const SCAM_RESULT: AnalysisResult = {
  verdict: "scam",
  riskScore: 92,
  scamType: "Digital arrest",
  summary: "This is a scam. Police never arrest anyone over a video call.",
  redFlags: [
    { phrase: "digital arrest", reason: "Digital arrest does not exist.", source: "rules" },
    { phrase: "safe account", reason: "No one asks you to move money.", source: "rules" },
    { phrase: "Stay on the video call", reason: "Keeps you isolated.", source: "ai" },
  ],
  actions: [],
  aiUsed: true,
  language: "en",
};

// jsdom cannot compute layout or colours, so contrast is checked with Lighthouse instead.
const AXE_OPTIONS = { rules: { "color-contrast": { enabled: false } } };

interface SentBody {
  text?: string;
  language: string;
}

function mockFetch(response: () => Response) {
  const fetchMock = vi.fn<(url: string, init?: RequestInit) => Promise<Response>>(() =>
    Promise.resolve(response()),
  );
  vi.stubGlobal("fetch", fetchMock);
  return fetchMock;
}

function jsonResponse(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json" },
  });
}

function sentBody(fetchMock: ReturnType<typeof mockFetch>, call = 0): SentBody {
  const body = fetchMock.mock.calls[call]?.[1]?.body;
  return JSON.parse(typeof body === "string" ? body : "{}") as SentBody;
}

beforeEach(() => {
  localStorage.clear();
  document.documentElement.removeAttribute("data-large-text");
});

afterEach(() => {
  cleanup();
  vi.unstubAllGlobals();
});

describe("App structure and accessibility", () => {
  it("has landmarks, exactly one h1 and labelled controls", () => {
    render(<App />);
    expect(screen.getByRole("banner")).toBeDefined();
    expect(screen.getByRole("main")).toBeDefined();
    expect(screen.getByRole("contentinfo")).toBeDefined();
    expect(screen.getAllByRole("heading", { level: 1 })).toHaveLength(1);
    expect(screen.getByLabelText("Paste the message you received")).toBeDefined();
    expect(screen.getByLabelText("Language")).toBeDefined();
  });

  it("always shows the 1930 helpline as a call link", () => {
    render(<App />);
    expect(screen.getByRole("link", { name: /Call 1930 now/ }).getAttribute("href")).toBe(
      "tel:1930",
    );
  });

  it("has no axe violations on the start screen", async () => {
    const { container } = render(<App />);
    expect((await axe(container, AXE_OPTIONS)).violations).toEqual([]);
  });

  it("toggles larger text for elderly users", async () => {
    render(<App />);
    const toggle = screen.getByRole("button", { name: /Larger text/ });
    await userEvent.click(toggle);
    expect(toggle.getAttribute("aria-pressed")).toBe("true");
    expect(document.documentElement.hasAttribute("data-large-text")).toBe(true);
  });

  it("switches between the paste and upload tabs with the arrow keys", async () => {
    render(<App />);
    const pasteTab = screen.getByRole("tab", { name: "Paste message" });
    pasteTab.focus();
    await userEvent.keyboard("{ArrowRight}");
    const uploadTab = screen.getByRole("tab", { name: "Upload screenshot" });
    expect(uploadTab.getAttribute("aria-selected")).toBe("true");
    expect(document.activeElement).toBe(uploadTab);
    expect(screen.getByLabelText(/Choose a screenshot/)).toBeDefined();
  });

  it("asks for a message when nothing was entered", async () => {
    const fetchMock = mockFetch(() => jsonResponse(SCAM_RESULT));
    render(<App />);
    await userEvent.click(screen.getByRole("button", { name: "Check message" }));
    expect(screen.getByRole("alert").textContent).toMatch(/paste a message/);
    expect(fetchMock).not.toHaveBeenCalled();
  });
});

describe("checking a message", () => {
  it("checks an example in one click and shows the verdict as text, with highlighted evidence", async () => {
    const fetchMock = mockFetch(() => jsonResponse(SCAM_RESULT));
    const { container } = render(<App />);
    await userEvent.click(screen.getByRole("button", { name: "Digital arrest" }));

    const result = await screen.findByRole("region", { name: "Result" });
    expect(sentBody(fetchMock).text).toMatch(/digital arrest/);
    expect(within(result).getByText("Scam")).toBeDefined();
    expect(within(result).getByText(/Digital arrest$/)).toBeDefined();
    expect(container.querySelector(".result-region")?.getAttribute("aria-live")).toBe("polite");

    const marks = result.querySelectorAll("mark");
    expect(marks.length).toBeGreaterThanOrEqual(3);
    expect(marks[0]?.textContent).toMatch(/^warning sign: /);
    expect(within(result).getAllByText("Found by rules")).toHaveLength(2);
    expect(within(result).getByText("Found by AI")).toBeDefined();

    expect((await axe(container, AXE_OPTIONS)).violations).toEqual([]);
  });

  it("shows the 1930 and cybercrime.gov.in steps when the user already sent money", async () => {
    mockFetch(() => jsonResponse(SCAM_RESULT));
    render(<App />);
    await userEvent.click(screen.getByRole("button", { name: "Digital arrest" }));
    const result = await screen.findByRole("region", { name: "Result" });

    expect(within(result).getByRole("link", { name: /sancharsaathi/ })).toBeDefined();
    const paid = within(result).getByRole("button", { name: "I already sent money" });
    await userEvent.click(paid);
    expect(paid.getAttribute("aria-pressed")).toBe("true");
    expect(within(result).getByRole("link", { name: "1930" }).getAttribute("href")).toBe(
      "tel:1930",
    );
    expect(
      within(result).getByRole("link", { name: "cybercrime.gov.in" }).getAttribute("href"),
    ).toBe("https://cybercrime.gov.in");
  });

  it("re-explains the result when the language changes, and marks the result's language", async () => {
    const fetchMock = mockFetch(() => jsonResponse(SCAM_RESULT));
    render(<App />);
    await userEvent.click(screen.getByRole("button", { name: "Digital arrest" }));
    await screen.findByRole("region", { name: "Result" });

    fetchMock.mockImplementation(() =>
      Promise.resolve(jsonResponse({ ...SCAM_RESULT, language: "hi", summary: "यह धोखा है।" })),
    );
    await userEvent.selectOptions(screen.getByLabelText("Language"), "hi");

    await waitFor(() => {
      expect(sentBody(fetchMock, 1).language).toBe("hi");
    });
    const result = await screen.findByRole("region", { name: "नतीजा" });
    expect(result.getAttribute("lang")).toBe("hi");
    expect(within(result).getByText("धोखा")).toBeDefined();
    expect(document.documentElement.lang).toBe("hi");
  });

  it("explains a rate limit in plain words", async () => {
    mockFetch(() => jsonResponse({ error: "Too many requests" }, 429));
    render(<App />);
    await userEvent.type(screen.getByLabelText("Paste the message you received"), "Hello");
    await userEvent.click(screen.getByRole("button", { name: "Check message" }));
    expect((await screen.findByRole("alert")).textContent).toMatch(/Too many checks/);
  });

  it("clears everything with 'Check another message'", async () => {
    mockFetch(() => jsonResponse(SCAM_RESULT));
    render(<App />);
    await userEvent.click(screen.getByRole("button", { name: "Digital arrest" }));
    await screen.findByRole("region", { name: "Result" });
    await userEvent.click(screen.getByRole("button", { name: "Check another message" }));
    expect(screen.queryByRole("region", { name: "Result" })).toBeNull();
    const textarea = screen.getByLabelText<HTMLTextAreaElement>("Paste the message you received");
    expect(textarea.value).toBe("");
    expect(document.activeElement).toBe(textarea);
  });
});
