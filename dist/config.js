/** Configuration schema and helpers for the subagent model pool plugin. */
import z from '@deepseek-ai/schemastery';
/** Schemastery schema; all fields are volatile so GUI changes take effect without reload. */
export const ConfigSchema = z.object({
    enabled: z.boolean().default(true).volatile()
        .description('Enable automatic model assignment for newly created subagents.'),
    models: z.array(z.object({
        provider: z.string().pattern(/^\S(?:.*\S)?$/).required(),
        model: z.string().pattern(/^\S(?:.*\S)?$/).required(),
        reasoningEffort: z.string().pattern(/^(?:|\S(?:.*\S)?)$/),
    })).default([]).volatile()
        .description('Round-robin model pool, e.g. [{provider:"workbuddy",model:"hy4flash"}].'),
});
/** Resolve a possibly volatile value to its live value. */
export function unwrap(value) {
    return typeof value === 'object' && value !== null && 'get' in value
        ? value.get()
        : value;
}
