/**
 * dsh-subagent-model-pool — assign newly created subagents to models from a plugin-owned pool.
 *
 * The plugin listens to the serial `agent/created` lifecycle event and records a
 * `model/selection` before the child AgentLoop starts. It never touches
 * `dsh-tool-subagent` or the parent's model selection.
 */
import type { Context } from '@deepseek-ai/cordis'
import { Service } from '@deepseek-ai/cordis'
import type { ModelSelection } from '@deepseek-ai/dsh-agent'
import { ReasoningEffortId } from '@deepseek-ai/dsh-llm'
import type {} from '@deepseek-ai/dsh-agent'
import { ConfigSchema, unwrap } from './config.ts'
import type { Config as PoolConfig, PoolModel } from './config.ts'
import { selectRoundRobin } from './round-robin.ts'

export const name = 'dsh-subagent-model-pool'
export const Config = ConfigSchema

declare module '@deepseek-ai/cordis' {
  interface Context {
    subagentModelPool: SubagentModelPoolService
  }
}

/** Plugin service with a process-local round-robin cursor. */
export class SubagentModelPoolService extends Service {
  static Config = ConfigSchema

  private cursor = 0
  readonly config: PoolConfig

  constructor(ctx: Context, config: PoolConfig) {
    super(ctx, 'subagentModelPool')
    this.config = config
  }

  protected [Service.init](): void {
    this.ctx.on('agent/created', ({ agent, source, signal }: { agent: any; source: string; signal?: AbortSignal }) => {
      if (source !== 'startup' || signal?.aborted) return
      if (agent.session.header.origin !== 'subagent') return
      if (!unwrap(this.config.enabled)) return

      const models = unwrap(this.config.models) as readonly PoolModel[]
      const picked = selectRoundRobin(models, this.cursor)
      if (!picked) return
      this.cursor += 1

      const selection: ModelSelection = {
        provider: picked.provider,
        model: picked.model,
        ...picked.reasoningEffort === undefined ? {} : { reasoningEffort: ReasoningEffortId(picked.reasoningEffort) },
      }
      agent.model.select(selection)
    })
  }
}

export default SubagentModelPoolService
