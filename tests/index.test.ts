import test from 'node:test'
import assert from 'node:assert/strict'
import { Context, Service } from '@deepseek-ai/cordis'
import { SubagentModelPoolService } from '../src/index.ts'

type TestSelection = { provider: string; model: string; reasoningEffort?: string }
type TestAgent = {
  session: { header: { origin?: string } }
  options: { provider?: string; model?: string }
  model: { selections: TestSelection[]; select(selection: TestSelection): void }
}

function createAgent(overrides: Partial<TestAgent> = {}): TestAgent {
  const agent: TestAgent = {
    session: { header: { origin: 'subagent' } },
    options: { provider: 'inherited-parent', model: 'inherited-model' },
    model: { selections: [], select(selection: TestSelection) { agent.model.selections.push(selection) } },
  }
  return Object.assign(agent, overrides)
}

function emitAgentCreated(ctx: Context, agent: TestAgent, source: string) {
  ;(ctx.emit as any)('agent/created', { agent, source, signal: undefined })
}

test('pool overrides an explicit/inherited child route for startup subagents', () => {
  const ctx = new Context()
  const service = new SubagentModelPoolService(ctx, {
    enabled: true,
    models: [
      { provider: 'workbuddy', model: 'hy4flash', reasoningEffort: 'high' },
      { provider: 'workbuddy-global', model: 'hy4flash-free' },
    ],
  })
  service[Service.init]()

  const first = createAgent()
  const second = createAgent({ options: { provider: 'explicit', model: 'explicit-model' } })
  emitAgentCreated(ctx, first, 'startup')
  emitAgentCreated(ctx, second, 'startup')

  assert.deepEqual(first.model.selections, [{ provider: 'workbuddy', model: 'hy4flash', reasoningEffort: 'high' }])
  assert.deepEqual(second.model.selections, [{ provider: 'workbuddy-global', model: 'hy4flash-free' }])
})

test('disabled plugin and non-startup or non-subagent agents are untouched', () => {
  const ctx = new Context()
  const service = new SubagentModelPoolService(ctx, {
    enabled: false,
    models: [{ provider: 'workbuddy', model: 'hy4flash' }],
  })
  service[Service.init]()
  const disabledAgent = createAgent()
  emitAgentCreated(ctx, disabledAgent, 'startup')
  assert.deepEqual(disabledAgent.model.selections, [])

  const enabledCtx = new Context()
  const enabledService = new SubagentModelPoolService(enabledCtx, {
    enabled: true,
    models: [{ provider: 'workbuddy', model: 'hy4flash' }],
  })
  enabledService[Service.init]()
  const resumeAgent = createAgent()
  const parentAgent = createAgent({ session: { header: {} } })
  emitAgentCreated(enabledCtx, resumeAgent, 'resume')
  emitAgentCreated(enabledCtx, parentAgent, 'startup')
  assert.deepEqual(resumeAgent.model.selections, [])
  assert.deepEqual(parentAgent.model.selections, [])
})