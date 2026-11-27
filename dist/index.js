import { Service } from '@deepseek-ai/cordis';
import { ReasoningEffortId } from '@deepseek-ai/dsh-llm';
import { ConfigSchema, unwrap } from './config.js';
import { selectRoundRobin } from './round-robin.js';
export const name = 'dsh-subagent-model-pool';
export const Config = ConfigSchema;
/** Plugin service with a process-local round-robin cursor. */
export class SubagentModelPoolService extends Service {
    static Config = ConfigSchema;
    cursor = 0;
    config;
    constructor(ctx, config) {
        super(ctx, 'subagentModelPool');
        this.config = config;
    }
    [Service.init]() {
        this.ctx.on('agent/created', ({ agent, source, signal }) => {
            if (source !== 'startup' || signal?.aborted)
                return;
            if (agent.session.header.origin !== 'subagent')
                return;
            if (!unwrap(this.config.enabled))
                return;
            const models = unwrap(this.config.models);
            const picked = selectRoundRobin(models, this.cursor);
            if (!picked)
                return;
            this.cursor += 1;
            const selection = {
                provider: picked.provider,
                model: picked.model,
                ...picked.reasoningEffort === undefined ? {} : { reasoningEffort: ReasoningEffortId(picked.reasoningEffort) },
            };
            agent.model.select(selection);
        });
    }
}
export default SubagentModelPoolService;
