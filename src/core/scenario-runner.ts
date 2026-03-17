import { ArtifactWriter } from './artifact-writer'
import type {
  ReportWriter,
  RunEnvironment,
  Scenario,
  ScenarioAssertion,
  ScenarioObservation,
  ScenarioResult,
  StudentSession
} from './contracts'

interface ScenarioRunnerOptions {
  scenario: Scenario
  session: StudentSession
  config: RunEnvironment
  assertions: ScenarioAssertion[]
  reports: ReportWriter[]
}

export class ScenarioRunner {
  async run(options: ScenarioRunnerOptions): Promise<ScenarioResult> {
    const startedAt = new Date()
    const runId = ArtifactWriter.buildRunId(options.scenario.name, startedAt)
    const artifacts = new ArtifactWriter(options.config.artifactsRoot, runId)
    const observations: ScenarioObservation[] = []
    const assertionFailures: ScenarioResult['assertionFailures'] = []

    const recordObservation = (observation: ScenarioObservation): void => {
      observations.push(observation)
    }

    let result: ScenarioResult = {
      runId,
      scenario: options.scenario.name,
      startedAt: startedAt.toISOString(),
      finishedAt: startedAt.toISOString(),
      status: 'error',
      target: options.config.target,
      observations,
      assertionFailures
    }

    try {
      await options.session.openTarget(options.config.target)
      const outcome = await options.scenario.run({
        config: options.config,
        session: options.session,
        artifacts,
        recordObservation
      })

      result = {
        ...result,
        outcome,
        status: 'passed'
      }

      for (const assertion of options.assertions) {
        try {
          await assertion.assert(result)
        } catch (error) {
          assertionFailures.push({
            assertion: assertion.name,
            message: error instanceof Error ? error.message : String(error)
          })
        }
      }

      if (assertionFailures.length > 0) {
        result.status = 'failed'
      }
    } catch (error) {
      result.errorMessage = error instanceof Error ? error.message : String(error)
      observations.push({
        code: 'scenario-runner-error',
        level: 'error',
        message: result.errorMessage
      })
    } finally {
      result.finishedAt = new Date().toISOString()

      if (result.outcome) {
        await artifacts.writeJson('transcripts/session-state.json', result.outcome.finalState)
        await artifacts.writeText(
          'transcripts/assistant-last.txt',
          result.outcome.finalState.lastAssistantTurn?.text ?? ''
        )
      }

      await artifacts.writeJson('result.json', result)
      for (const report of options.reports) {
        await report.write(result, artifacts)
      }

      await options.session.close()
    }

    return result
  }
}
