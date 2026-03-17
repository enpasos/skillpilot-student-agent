# ADR 0001: Browser Student Harness With Hard Role Separation

## Status

Accepted.

## Context

SkillPilot already defines tutor behavior in the Custom GPT configuration:

- system instructions
- knowledge documents
- optimized Actions/OpenAPI setup
- centrally managed DE/EN GPT entry points

What is missing is an external browser-driven student harness that verifies whether those contracts survive real ChatGPT browser execution.

Loose scripts would blur responsibilities and make it too easy to reimplement tutor behavior in the wrong place.

## Decision

We create a separate repo with hard layer boundaries:

- `core` for scenario contracts and orchestration
- `drivers/openclaw` for browser control
- `adapters` for UI-specific interpretation
- `scenarios` for end-to-end learner journeys
- `assertions` for black-box contract checks

The first mandatory contract is:

> If a valid SkillPilot UUID is present, the learner state must load immediately. The UUID alone is sufficient. Cockpit/browser activation detours are forbidden.

## Consequences

Positive:

- external black-box coverage complements internal prompt contract tests
- tutor behavior remains owned by the Custom GPT, not this repo
- browser engine can change without rewriting scenario logic

Tradeoff:

- UI selector drift is isolated in adapters/drivers and must be maintained there
