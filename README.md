# ML System Design Interview Companion

An end-to-end web experience that guides candidates through a one-hour, machine-learning system design interview. The application replaces the legacy company/topic picker with curated interview scenarios, a Start screen, timed segments, and an OpenAI-powered interviewer.

## Product Vision

1. **Guided one-hour flow** — Users land on a minimalist Start screen that highlights the default interview scenario (company + topic) while allowing switches before the session begins.
2. **Structured requirements briefing** — After starting, candidates review the scenario requirements to align on objectives before answering questions.
3. **Timed interviewer-led segments** — The session is broken into five consecutive blocks with timers, pause controls, and automatic transitions:
   - Problem formulation (10 minutes)
   - Data strategy & feature engineering (15 minutes)
   - Model architecture & training (20 minutes)
   - Serving & optimization (10 minutes)
   - Advanced topics & edge cases (5 minutes)
4. **LLM-driven Q&A** — Each segment hosts a chat panel where an OpenAI-powered interviewer asks probing questions and reacts to candidate answers without streaming for the first iteration.
5. **Google SSO & persistence** — Users authenticate with Google, enabling transcript storage, session history, and personal default scenario preferences.
6. **Wrap-up insights** — Upon completion, candidates receive a transcript review with export options and prompts for next steps.

## Implementation Roadmap

### 1. Scenario Foundation
- Create a manifest (e.g., `content/scenarios.json`) describing each interview scenario, default flags, and segment metadata.
- Replace the company/topic APIs with `/api/scenarios` endpoints that expose the manifest and load prompts by scenario id.

### 2. Start Screen & Intro Experience
- Refactor the landing page into staged UI (`intro → session → summary`) with Start CTA, scenario preview, and picker modal.
- Present scenario requirements immediately after the user starts to establish shared understanding.

### 3. Session Controller & Timer
- Implement a hook/context that manages segment order, remaining time, pause/resume, and auto-advancement across the five blocks.
- Surface countdowns, progress indicators, and manual controls within the session layout.

### 4. OpenAI Interviewer Integration
- Define segment-specific prompt templates describing interviewer expectations.
- Build an API route (e.g., `pages/api/session/messages.js`) that sends chat history and segment context to OpenAI and returns responses.
- Render a chat interface that tags messages by segment and reflects timer transitions.

### 5. Authentication & Persistence
- Configure NextAuth with Google provider, Prisma adapter, and models for users, interview sessions, and transcripts.
- Gate the session experience behind authentication and save transcripts/default scenario preferences per user.

### 6. Wrap-up & Settings
- Deliver a summary stage that shows the transcript, downloadable artifacts, and restart/change-scenario options.
- Introduce a protected user settings page for managing default scenario selection (with room for future preferences).

## Related Documentation

- [ML Interview Practice Roadmap](docs/ml-interview-roadmap.md) — detailed milestone breakdown and task dependencies supporting this vision.

## Development

- Install dependencies: `npm install`
- Run the Next.js app: `npm run dev`
- Environment requirements: Node.js ≥ 18, `OPENAI_API_KEY`, Google OAuth credentials.
