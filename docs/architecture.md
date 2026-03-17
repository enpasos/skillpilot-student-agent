# Architecture

## Intent

`skillpilot-student-agent` is the external browser-side counterpart to SkillPilot's internal prompt and UUID contract tests.

It must not duplicate tutor logic. It verifies whether the already-configured Custom GPT honors the contract in a real browser session.

## Layers

### Core

Owns:

- scenario interfaces
- runner orchestration
- policy fragments for prohibited detours
- artifact/report writing

Must not know:

- DOM selectors
- browser launch details
- ChatGPT page structure

### Drivers

Own concrete browser control.

The current implementation keeps the folder name `openclaw` as the stable driver boundary. The concrete executor below that boundary is Playwright for now. If OpenClaw becomes the preferred engine later, the scenario and assertion layers should stay untouched.

### Adapters

Translate browser/session state into domain observations:

- detect the latest ChatGPT response
- detect SkillPilot deep links
- follow deep links
- return to chat

### Scenarios

Compose one end-to-end behavior slice each:

- `resume-with-uuid`
- `deep-link-roundtrip`
- `exam-mode`

### Assertions

Evaluate the contract from black-box evidence:

- UUID resume must not produce cockpit detours
- a detected deep link must actually be followed
- after the app roundtrip the chat must continue from live state

## Artifacts

Each run writes a dedicated directory under `artifacts/<run-id>/`:

- `result.json`
- `transcripts/session-state.json`
- `transcripts/assistant-last.txt`
- `reports/junit.xml`
- `reports/report.html`

## Contract Sources

The first milestone is aligned with the main `skillpilot` repo:

- central GPT URLs from `app/src/utils/skillpilotGpt.ts`
- prompt contract from `backend/src/test/java/com/skillpilot/backend/ai/AiPromptContractTest.java`
- deep-link and state-machine rules from the Custom GPT docs
