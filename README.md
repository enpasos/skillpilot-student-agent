# skillpilot-student-agent

Browser-driven student harness for black-box end-to-end checks of SkillPilot tutor flows.

This repo does not rebuild tutor logic. The tutor already exists as a Custom GPT with system instructions, knowledge docs, and optimized Actions/OpenAPI setup. This harness owns the external side only:

- browser-driving student behavior
- scenario execution
- black-box assertions
- artifact and report generation

## First milestone

The first contract slice is `resume-with-uuid`:

1. Open the configured SkillPilot GPT entry point.
2. Send an existing SkillPilot UUID as the only learner input.
3. Fail if the assistant asks for cockpit/browser detours such as `Open the cockpit first` or `type ready`.
4. If a SkillPilot deep link appears, follow it.
5. Return to ChatGPT.
6. Send a short return message and verify that the conversation continues from current state.

This mirrors the internal prompt contract test in the main `skillpilot` repo with an external browser-facing counterpart.

## Architecture

```text
config/
  gpt-targets.ts
  env.example.json

docs/
  architecture.md
  adr/0001-browser-student-harness.md

src/
  core/
  drivers/openclaw/
  adapters/chatgpt/
  adapters/skillpilot/
  scenarios/
  assertions/
  reports/
  testing/
```

Layering rules:

- `core` knows scenarios, contracts, outcomes, and artifacts.
- `drivers/openclaw` owns concrete browser control only.
- `adapters` know ChatGPT and SkillPilot UI semantics.
- `assertions` check black-box behavior contracts.

## Commands

```bash
npm install
npm test
npm run build
```

Run the first live scenario with a local config file:

```bash
cp config/env.example.json config/env.local.json
npm run scenario:resume -- config/env.local.json
```

The runner writes structured output below `artifacts/<run-id>/`.

## Notes

- The DE/EN GPT entry points are copied from the central `skillpilot` app config and kept in `config/gpt-targets.ts`.
- The current browser implementation uses Playwright behind the `drivers/openclaw` boundary so the scenario layer stays independent from the concrete executor.
