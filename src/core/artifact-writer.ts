import { mkdir, writeFile } from 'node:fs/promises'
import path from 'node:path'
import type { ArtifactSink } from './contracts'

export class ArtifactWriter implements ArtifactSink {
  readonly runDir: string

  constructor(
    readonly rootDir: string,
    readonly runId: string
  ) {
    this.runDir = path.join(rootDir, runId)
  }

  async writeJson(relativePath: string, value: unknown): Promise<string> {
    const targetPath = path.join(this.runDir, relativePath)
    await mkdir(path.dirname(targetPath), { recursive: true })
    await writeFile(targetPath, JSON.stringify(value, null, 2) + '\n', 'utf8')
    return targetPath
  }

  async writeText(relativePath: string, value: string): Promise<string> {
    const targetPath = path.join(this.runDir, relativePath)
    await mkdir(path.dirname(targetPath), { recursive: true })
    await writeFile(targetPath, value, 'utf8')
    return targetPath
  }

  static buildRunId(scenarioName: string, now = new Date()): string {
    const stamp = now.toISOString().replace(/[:.]/g, '-')
    const safeScenario = scenarioName.replace(/[^a-z0-9-]/gi, '-').toLowerCase()
    return `${stamp}-${safeScenario}`
  }
}
