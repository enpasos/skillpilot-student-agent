import assert from 'node:assert/strict'
import test from 'node:test'
import { noCockpitDetourAssertion } from '../assertions/no-cockpit-detour'
import { returnToChatAssertion } from '../assertions/return-to-chat'
import { uuidLoadContractAssertion } from '../assertions/uuid-load-contract'
import { deepLinkFollowedAssertion } from '../assertions/deep-link-followed'
import type { DeepLink, GptTarget, SessionState, StudentSession } from '../core/contracts'
import { ScenarioRunner } from '../core/scenario-runner'
import { htmlReportWriter } from '../reports/html-report'
import { junitWriter } from '../reports/junit-writer'
import { resumeWithUuidScenario } from '../scenarios/resume-with-uuid'

const target: GptTarget = {
  key: 'de',
  label: 'SkillPilot GPT Deutsch',
  url: 'https://chatgpt.com/g/example'
}

class FakeSession implements StudentSession {
  private states: SessionState[]
  private stateIndex = 0
  private currentState: SessionState
  private lastSentMessage = ''
  private openedTarget?: GptTarget
  deepLinkFollowed = false
  returnedToChat = false

  constructor(states: SessionState[]) {
    this.states = states
    this.currentState = states[0]
  }

  async openTarget(targetConfig: GptTarget): Promise<void> {
    this.openedTarget = targetConfig
  }

  async sendLearnerMessage(message: string): Promise<void> {
    this.lastSentMessage = message
    if (this.stateIndex < this.states.length - 1) {
      this.stateIndex += 1
      this.currentState = this.states[this.stateIndex]
    }
  }

  async refreshState(): Promise<SessionState> {
    return this.currentState
  }

  async followDeepLink(_link: DeepLink): Promise<void> {
    this.deepLinkFollowed = true
  }

  async returnToChat(): Promise<void> {
    this.returnedToChat = true
  }

  async close(): Promise<void> {
    void this.lastSentMessage
    void this.openedTarget
  }
}

const createState = (assistantText: string, links: DeepLink[] = []): SessionState => ({
  target,
  currentUrl: 'https://chatgpt.com/g/example',
  messages: [
    {
      role: 'user',
      text: '0824a2e2-5981-447d-b6de-9a14d0929c21',
      createdAt: new Date().toISOString(),
      links: []
    },
    {
      role: 'assistant',
      text: assistantText,
      createdAt: new Date().toISOString(),
      links
    }
  ],
  lastUserTurn: {
    role: 'user',
    text: '0824a2e2-5981-447d-b6de-9a14d0929c21',
    createdAt: new Date().toISOString(),
    links: []
  },
  lastAssistantTurn: {
    role: 'assistant',
    text: assistantText,
    createdAt: new Date().toISOString(),
    links
  }
})

test('resume-with-uuid passes when the GPT resumes directly and roundtrips through a deep link', async () => {
  const deepLink: DeepLink = {
    url: 'https://skillpilot.com/?skillpilotId=0824a2e2-5981-447d-b6de-9a14d0929c21&l=curriculum&goal=goal-1',
    label: 'Start Exercise',
    origin: 'assistant-markdown'
  }

  const session = new FakeSession([
    createState(''),
    createState(
      'Learning goal: Binomial distribution\nWe practice this most effectively with the interactive trainer:\nStart Exercise',
      [deepLink]
    ),
    createState('Welcome back. Next step: compare your result with the active learning goal.')
  ])

  const runner = new ScenarioRunner()
  const result = await runner.run({
    scenario: resumeWithUuidScenario,
    session,
    config: {
      language: 'de',
      target,
      skillpilotId: '0824a2e2-5981-447d-b6de-9a14d0929c21',
      followUpMessageAfterReturn: 'Ich bin zurueck.',
      artifactsRoot: './artifacts'
    },
    assertions: [
      uuidLoadContractAssertion,
      noCockpitDetourAssertion,
      deepLinkFollowedAssertion,
      returnToChatAssertion
    ],
    reports: [junitWriter, htmlReportWriter]
  })

  assert.equal(result.status, 'passed')
  assert.equal(session.deepLinkFollowed, true)
  assert.equal(session.returnedToChat, true)
})

test('resume-with-uuid fails on forbidden cockpit detours', async () => {
  const session = new FakeSession([
    createState(''),
    createState('Open the cockpit first and type ready once you are there.')
  ])

  const runner = new ScenarioRunner()
  const result = await runner.run({
    scenario: resumeWithUuidScenario,
    session,
    config: {
      language: 'en',
      target,
      skillpilotId: '0824a2e2-5981-447d-b6de-9a14d0929c21',
      artifactsRoot: './artifacts'
    },
    assertions: [
      uuidLoadContractAssertion,
      noCockpitDetourAssertion,
      deepLinkFollowedAssertion,
      returnToChatAssertion
    ],
    reports: [junitWriter, htmlReportWriter]
  })

  assert.equal(result.status, 'failed')
  assert.equal(
    result.assertionFailures.some((failure) => failure.assertion === 'no-cockpit-detour'),
    true
  )
})
