import type { ArtifactSink, ReportWriter, ScenarioResult } from '../core/contracts'

const escapeXml = (value: string): string =>
  value
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&apos;')

export const junitWriter: ReportWriter = {
  name: 'junit',
  async write(result: ScenarioResult, artifacts: ArtifactSink): Promise<string> {
    const failures = result.assertionFailures
      .map(
        (failure) =>
          `<failure message="${escapeXml(failure.assertion)}">${escapeXml(failure.message)}</failure>`
      )
      .join('')

    const error = result.errorMessage
      ? `<error message="scenario-error">${escapeXml(result.errorMessage)}</error>`
      : ''

    const xml =
      '<?xml version="1.0" encoding="UTF-8"?>\n' +
      `<testsuite name="${escapeXml(result.scenario)}" tests="1" failures="${result.assertionFailures.length}" errors="${result.errorMessage ? 1 : 0}">` +
      `<testcase classname="skillpilot.student.agent" name="${escapeXml(result.scenario)}">` +
      failures +
      error +
      '</testcase>' +
      '</testsuite>\n'

    return artifacts.writeText('reports/junit.xml', xml)
  }
}
