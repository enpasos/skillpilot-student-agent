import type { ArtifactSink, ReportWriter, ScenarioResult } from '../core/contracts'

const escapeHtml = (value: string): string =>
  value
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')

export const htmlReportWriter: ReportWriter = {
  name: 'html',
  async write(result: ScenarioResult, artifacts: ArtifactSink): Promise<string> {
    const observations = result.observations
      .map(
        (observation) =>
          `<li><strong>${escapeHtml(observation.level.toUpperCase())}</strong> ${escapeHtml(
            observation.code
          )}: ${escapeHtml(observation.message)}</li>`
      )
      .join('')

    const failures = result.assertionFailures
      .map(
        (failure) =>
          `<li><strong>${escapeHtml(failure.assertion)}</strong>: ${escapeHtml(failure.message)}</li>`
      )
      .join('')

    const assistantText = escapeHtml(result.outcome?.finalState.lastAssistantTurn?.text ?? '')
    const html = `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <title>${escapeHtml(result.scenario)} report</title>
  <style>
    :root { color-scheme: light; font-family: "IBM Plex Sans", "Segoe UI", sans-serif; }
    body { margin: 2rem auto; max-width: 960px; line-height: 1.5; color: #16202a; background: linear-gradient(180deg, #f7f9fb 0%, #eef4f8 100%); }
    main { background: rgba(255,255,255,0.92); border: 1px solid #d9e3ea; border-radius: 18px; padding: 2rem; box-shadow: 0 12px 32px rgba(18, 33, 51, 0.08); }
    pre { white-space: pre-wrap; background: #f3f7fa; padding: 1rem; border-radius: 12px; }
  </style>
</head>
<body>
  <main>
    <h1>${escapeHtml(result.scenario)}</h1>
    <p>Status: <strong>${escapeHtml(result.status)}</strong></p>
    <h2>Observations</h2>
    <ul>${observations}</ul>
    <h2>Assertion Failures</h2>
    <ul>${failures || '<li>None</li>'}</ul>
    <h2>Last Assistant Response</h2>
    <pre>${assistantText}</pre>
  </main>
</body>
</html>
`

    return artifacts.writeText('reports/report.html', html)
  }
}
