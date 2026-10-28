# Satark — hackathon plan (PromptWars x Kick To Tech 2026)

**Hard deadline: today, 28 Oct 2026, 5:00 PM IST.** 2 submission attempts. Individual.
Submit: public GitHub repo + **Cloud Run URL** + LinkedIn post URL.

## Problem statement (paste this wherever they ask)

> Every day, Indian families receive scam messages — fake KYC alerts, "digital arrest" threats,
> UPI collect-request tricks, parcel and electricity-cut scams, task-job and investment frauds.
> I4C data shows about ₹19,813 crore reported lost to cyber fraud in 2025 across roughly
> 21.8 lakh complaints. The people most at risk — elderly parents and first-time smartphone users —
> often can't read the English in these messages and have nobody to ask in the moment.
>
> **Satark** is a personal digital safety assistant for Indian families. Paste a message or upload a
> screenshot and get, in seconds and in your own language: a clear verdict (Scam / Suspicious /
> Looks safe), the evidence (the exact red-flag words highlighted in the message), and step-by-step
> next steps for your situation — just received it, clicked or shared details, or already paid —
> pointing only to verified official channels (1930, cybercrime.gov.in, Sanchar Saathi Chakshu).
> It combines a transparent rule engine with Gemini, reads explanations aloud, and stores nothing.

**How it differs (say it honestly, don't claim "first"):** reputation tools such as Truecaller's
Scam Checker (launched in India 28 Sep 2026) look up numbers and links that others have reported.
Satark reads the message itself, so it still catches a brand-new scam from an unreported number.
It shows its evidence, works from screenshots, explains in 8 Indian languages with read-aloud, and
gives situation-specific next steps.

Domain tags: **cybersecurity + accessibility + social impact.**

Why this wins: real and national-scale problem, clear target user, a 10-second demo that anyone
understands, AI that is essential (screenshot reading, context, 8 Indian languages) rather than
decorative, and a security story that matches the Security grading parameter (prompt-injection
defence, PII redaction, no storage).

## Timeline (adjust to the clock; protect the last hour)

| Time (IST)    | Do                                                                                                                                 |
| ------------- | ---------------------------------------------------------------------------------------------------------------------------------- |
| 12:15 – 12:30 | Get Gemini key (aistudio.google.com → Get API key). Create empty **public** GitHub repo `satark`. Open this folder in Antigravity. |
| 12:30 – 13:00 | Claude Code: Stage 1 (scaffold). Push. **First Cloud Run deploy now** (steps below).                                               |
| 13:00 – 13:45 | Stage 2: rule engine + redaction + scoring + tests.                                                                                |
| 13:45 – 14:30 | Stage 3: Gemini + `/api/analyze`. Test one live call.                                                                              |
| 14:30 – 15:15 | Stage 4: frontend. Redeploy. Test on your phone.                                                                                   |
| 15:15 – 15:45 | Stage 5 hardening + CI. Stage 6 README + screenshots. Redeploy.                                                                    |
| 15:45 – 16:05 | LinkedIn post (draft below).                                                                                                       |
| **16:10**     | **Submission attempt 1.** Read the AI feedback in Attempt History.                                                                 |
| 16:10 – 16:40 | Fix the weakest parameter it reports. Redeploy.                                                                                    |
| **16:45**     | **Attempt 2 (final).** Do not wait until 4:58.                                                                                     |

If you are behind at 15:30: cut the screenshot upload and extra languages (keep English + Hindi),
never cut tests, README or the deploy.

## Starting prompt for Claude Code in Antigravity

> Read CLAUDE.md and HACKATHON_PLAN.md in this folder. We have until 5 PM IST. Start Stage 1 now,
> run its gate, commit, and then stop so I can do the first Cloud Run deploy.

After the deploy: "Deploy works. Continue with Stage 2" — and so on, one stage per prompt.

## Cloud Run deploy (gcloud and Docker are NOT installed on your laptop — use Cloud Shell)

1. Go to console.cloud.google.com, pick or create a project. Cloud Run needs a **billing account
   linked** (use the hackathon's credits if they gave any; the free tier covers this app).
2. Open **Cloud Shell** (the `>_` icon, top right). It already has `gcloud` and `git`.
3. In Cloud Shell:
   ```bash
   git clone https://github.com/<your-username>/satark.git && cd satark
   gcloud services enable run.googleapis.com cloudbuild.googleapis.com artifactregistry.googleapis.com secretmanager.googleapis.com
   printf '%s' 'PASTE_YOUR_GEMINI_KEY' | gcloud secrets create GEMINI_API_KEY --data-file=-
   gcloud run deploy satark --source . --region asia-south1 --allow-unauthenticated \
     --set-secrets GEMINI_API_KEY=GEMINI_API_KEY:latest --memory 512Mi --max-instances 3
   ```
   If it complains about secret access, grant the shown service account the
   **Secret Manager Secret Accessor** role (IAM page) and rerun the deploy.
   The key lives in Secret Manager — that's a point for Security; mention it in the README.
4. Copy the `https://satark-xxxx.a.run.app` URL it prints. That is your **Deployed Link**.
5. Every redeploy: `git pull && gcloud run deploy satark --source . --region asia-south1` (it
   remembers the other flags).

First deploy at 13:00 is deliberate: billing/API/permission errors take time to sort out, and you
want them while you still have hours.

## Demo flow (60–90 seconds)

1. "My parents get messages like this every week." Click the **Digital arrest** example → red
   **Scam** verdict, phrases highlighted, explained.
2. Switch language to **हिंदी** → same result explained in Hindi → press **Read aloud**.
3. Upload a **screenshot** of a fake KYC SMS → Gemini reads it, flags it.
4. Click the **genuine bank OTP** example → "Looks safe" (shows it's not crying wolf).
5. On the digital-arrest result, press **"I already sent money"** → the playbook switches to 1930 +
   cybercrime.gov.in. Then **Share warning with family**.
6. Close: "Every warning points at evidence, every next step points to an official channel, the
   AI never makes up a phone number, and nothing is stored." Show the eval numbers from the README.

Prepare 3 sample messages written by you (don't use real people's numbers).

## LinkedIn post (edit into your own voice before posting)

> Built **Satark** in 6 hours at #PromptWars x Kick To Tech 2026 (Google for Developers × Hack2skill).
>
> The problem: India reported ~₹19,800 crore lost to cyber fraud in 2025 (I4C). Fake KYC alerts,
> "digital arrest" calls, UPI collect tricks — and the people most targeted are often our parents,
> who can't always read these messages or ask someone in time.
>
> Satark is a personal digital safety assistant for families: paste a message or upload a
> screenshot → a verdict with the evidence highlighted in the message, and next steps for your
> situation (just received / clicked / already paid) pointing only to official channels — 1930,
> cybercrime.gov.in, Sanchar Saathi Chakshu — in 8 Indian languages, read aloud.
>
> Under the hood: a transparent rule engine + Gemini, every AI warning checked against the actual
> message, no AI-generated phone numbers or links, prompt-injection defence, PII redaction before
> AI, nothing stored, deployed on Google Cloud Run.
>
> Try it: <Cloud Run URL>
> Code: <GitHub URL>
>
> #BuildWithAI #GoogleForDevelopers #Hack2skill #Gemini #CloudRun #CyberSafety

Set the post to public, then copy the **post** URL (not your profile URL) into the form.

## Final checklist before each submission

- [ ] Repo is **public**, README starts with the problem statement, no `.env` / key in history
- [ ] Cloud Run URL opens in an incognito window and an analysis works
- [ ] `npm run lint && npm run typecheck && npm test && npm run build` green; CI badge green
- [ ] LinkedIn post is public; URL starts with https://
- [ ] Challenge selected: "Build What Matters: The AI-Powered Student Innovation Challenge"
