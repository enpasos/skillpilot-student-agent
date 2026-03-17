import { htmlReportWriter } from '../reports/html-report'
import { junitWriter } from '../reports/junit-writer'
import { noCockpitDetourAssertion } from '../assertions/no-cockpit-detour'
import { uuidLoadContractAssertion } from '../assertions/uuid-load-contract'
import { deepLinkFollowedAssertion } from '../assertions/deep-link-followed'
import { returnToChatAssertion } from '../assertions/return-to-chat'
import { loadRunConfig } from '../core/load-run-config'
import { ScenarioRunner } from '../core/scenario-runner'
import { OpenClawBrowserDriver } from '../drivers/openclaw/browser-driver'
import { ChatGptSession } from '../drivers/openclaw/chatgpt-session'
import { deepLinkRoundtripScenario } from '../scenarios/deep-link-roundtrip'
import { examModeScenario } from '../scenarios/exam-mode'
import { resumeWithUuidScenario } from '../scenarios/resume-with-uuid'

const scenarioName = process.argv[2] ?? 'resume-with-uuid'
const configPath = process.argv[3] ?? 'config/env.local.json'

const scenarios = {
  'resume-with-uuid': resumeWithUuidScenario,
  'deep-link-roundtrip': deepLinkRoundtripScenario,
  'exam-mode': examModeScenario
} as const

const scenario = scenarios[scenarioName as keyof typeof scenarios]

if (!scenario) {
  throw new Error(`Unknown scenario "${scenarioName}"`)
}

const main = async (): Promise<void> => {
  const config = await loadRunConfig(configPath, scenario.name)
  const driver = new OpenClawBrowserDriver({
    headless: config.browser.headless,
    storageStatePath: config.browser.storageStatePath
  })
  const session = new ChatGptSession(driver, {
    assistantTimeoutMs: config.browser.assistantTimeoutMs
  })

  const runner = new ScenarioRunner()
  const result = await runner.run({
    scenario,
    session,
    config,
    assertions: [
      uuidLoadContractAssertion,
      noCockpitDetourAssertion,
      deepLinkFollowedAssertion,
      returnToChatAssertion
    ],
    reports: [junitWriter, htmlReportWriter]
  })

  process.stdout.write(`${result.status.toUpperCase()} ${result.scenario} ${result.runId}\n`)
  if (result.assertionFailures.length > 0) {
    for (const failure of result.assertionFailures) {
      process.stdout.write(`ASSERTION ${failure.assertion}: ${failure.message}\n`)
    }
  }
  if (result.errorMessage) {
    process.stdout.write(`ERROR ${result.errorMessage}\n`)
  }
}

void main()
