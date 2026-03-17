export type Language = 'de' | 'en'

export interface GptTarget {
  key: Language
  label: string
  url: string
}

export interface DeepLink {
  url: string
  label: string
  origin: 'assistant-markdown' | 'assistant-plain-url'
}

export interface ChatTurn {
  role: 'user' | 'assistant' | 'system'
  text: string
  createdAt: string
  links: DeepLink[]
}

export interface DetectedGptState {
  deepLinks: DeepLink[]
  prohibitedDetours: string[]
  resumeSignals: string[]
  resumeConfidence: 'low' | 'medium' | 'high'
}

export interface SessionState {
  target: GptTarget
  currentUrl: string
  messages: ChatTurn[]
  lastAssistantTurn?: ChatTurn
  lastUserTurn?: ChatTurn
  detected?: DetectedGptState
}

export interface ScenarioObservation {
  code: string
  level: 'info' | 'warn' | 'error'
  message: string
  data?: Record<string, unknown>
}

export interface ScenarioOutcome {
  initialState: SessionState
  finalState: SessionState
  assistantText: string
  continuationText?: string
  deepLink?: DeepLink
  deepLinkFollowed: boolean
  returnedToChat: boolean
  stateReloadedAfterReturn: boolean
  prohibitedDetours: string[]
  resumeConfidence: 'low' | 'medium' | 'high'
}

export interface AssertionFailure {
  assertion: string
  message: string
}

export interface ScenarioResult {
  runId: string
  scenario: string
  startedAt: string
  finishedAt: string
  status: 'passed' | 'failed' | 'error'
  target: GptTarget
  observations: ScenarioObservation[]
  outcome?: ScenarioOutcome
  assertionFailures: AssertionFailure[]
  errorMessage?: string
}

export interface RunEnvironment {
  language: Language
  target: GptTarget
  skillpilotId: string
  followUpMessageAfterReturn?: string
  artifactsRoot: string
  requireDeepLink?: boolean
}

export interface ArtifactSink {
  readonly rootDir: string
  readonly runDir: string
  writeJson(relativePath: string, value: unknown): Promise<string>
  writeText(relativePath: string, value: string): Promise<string>
}

export interface StudentSession {
  openTarget(target: GptTarget): Promise<void>
  sendLearnerMessage(message: string): Promise<void>
  refreshState(): Promise<SessionState>
  followDeepLink(link: DeepLink): Promise<void>
  returnToChat(): Promise<void>
  close(): Promise<void>
}

export interface ScenarioRuntime {
  config: RunEnvironment
  session: StudentSession
  artifacts: ArtifactSink
  recordObservation(observation: ScenarioObservation): void
}

export interface Scenario {
  name: string
  run(runtime: ScenarioRuntime): Promise<ScenarioOutcome>
}

export interface ScenarioAssertion {
  name: string
  assert(result: ScenarioResult): void | Promise<void>
}

export interface ReportWriter {
  name: string
  write(result: ScenarioResult, artifacts: ArtifactSink): Promise<string | void>
}

export interface LoadedRunConfig extends RunEnvironment {
  browser: {
    headless: boolean
    assistantTimeoutMs: number
    storageStatePath?: string
  }
  skillpilotBaseUrl: string
}
