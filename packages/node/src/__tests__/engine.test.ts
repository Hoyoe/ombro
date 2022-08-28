import path from 'path'
import { describe, beforeAll, afterAll, it, expect, vi } from 'vitest'

describe.skip('@ombro/node', () => {
  beforeAll(() => {
    vi.spyOn(console, 'log').mockImplementation(() => void 0)
  })

  afterAll(() => {
    vi.restoreAllMocks()
  })

  it('Correct entry file, able to compile and execute', async () => {
    const { createEngine } = await import('../engine')
    const engine = createEngine()
    expect(engine).toBeDefined()
    expect(() => {
      engine.boot({ entry: path.join(__dirname, 'script.js') })
    }).not.toThrow()
  })

  it('Wrong entry file, will throw error', async () => {
    const { createEngine } = await import('../engine')
    const engine = createEngine()
    expect(() => {
      engine.boot({ entry: path.join(__dirname, 'script2.js') })
    }).toThrow('not exists')
  })
})
