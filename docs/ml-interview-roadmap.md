# ML Interview Practice Roadmap

## Product Vision Summary

Our ML interview practice platform guides candidates through a realistic mock interview session using five timed segments while providing AI-driven coaching and persistence for future review.

### Start Screen & Scenario Selection
- Present a welcoming Start screen summarizing the session flow and expectations.
- Default scenario auto-selects a "General ML System Design" interview, with the ability to browse other templates.
- Show duration estimates for each segment and a prominent **Start Session** call-to-action.

### Session Flow: Five Timed Segments
1. **Warm-Up (5 minutes):** Calibrate expectations, gather candidate goals, and surface relevant context.
2. **Problem Framing (10 minutes):** Introduce the scenario, clarify constraints, and outline evaluation criteria.
3. **Solution Exploration (15 minutes):** Candidate collaborates with guided prompts to architect solutions and discuss trade-offs.
4. **Deep Dive Q&A (10 minutes):** LLM delivers adaptive follow-up questions and probes for depth.
5. **Wrap-Up & Feedback (5 minutes):** Summarize key decisions, capture self-reflection notes, and outline follow-up resources.

A visible session timer with segment progress indicators maintains pacing, with smooth transitions and a buffer to adjust durations if an interviewer extends or shortens a segment.

### LLM-Guided Q&A Expectations
- Use an LLM agent to supply context-aware hints, probing questions, and rubric-aligned feedback.
- Provide configurable difficulty settings and ensure prompts reference candidate inputs collected earlier in the session.
- Log Q&A exchanges for review, flagging noteworthy responses that need deeper reflection.

### Authentication & Persistence
- Require user authentication before starting a session to access personalized history.
- Persist session metadata (scenario, timestamps, responses, LLM prompts) to enable retrospective analysis and future practice planning.
- Support autosave behavior to recover from interruptions and sync across devices.

### Planned User Settings
- Manage notification preferences for follow-up reminders and feedback digests.
- Configure default session templates, segment durations, and coaching tone.
- Opt-in controls for sharing anonymized data to improve LLM prompt tuning.

## Phased Milestones & Task Stubs

| Phase | Focus | Task Stubs & Dependencies |
| --- | --- | --- |
| **1. Data Model Pivot** | Revisit core entities to support segmented sessions and LLM artifacts. | 1.1 Define session, segment, and prompt schemas. 1.2 Update persistence layer migrations. 1.3 Backfill or migrate existing mock data. |
| **2. Intro UI** | Build Start screen and scenario selection experience. | Depends on Phase 1 for scenario metadata. 2.1 Design layout with session overview + CTA. 2.2 Implement default scenario selection logic. 2.3 Hook into router/navigation for session start. |
| **3. Session Controller** | Orchestrate timed segments with progress UI. | Depends on Phases 1–2 for data sources and navigation. 3.1 Implement timer state machine. 3.2 Create segment transition animations. 3.3 Log segment events for persistence. |
| **4. LLM Integration** | Power adaptive questioning and coaching. | Depends on Phase 1 for prompt schemas and Phase 3 for session context. 4.1 Connect to LLM provider SDK. 4.2 Implement context packaging pipeline. 4.3 Surface responses in UI with moderation fallbacks. |
| **5. Auth & Persistence** | Secure sessions and store artifacts. | Depends on Phase 1 schemas. 5.1 Integrate authentication provider. 5.2 Persist session transcripts and settings. 5.3 Implement autosave & resume flow. |
| **6. Wrap-Up Experience** | Deliver feedback and settings controls. | Depends on Phases 3–5. 6.1 Build summary dashboard with metrics. 6.2 Enable user settings panel. 6.3 Provide export/share options. |

Each task stub can be expanded into tickets with detailed acceptance criteria, ensuring teams understand sequencing and cross-team dependencies before implementation.
