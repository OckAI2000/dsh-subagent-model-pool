/** Configuration schema and helpers for the subagent model pool plugin. */
import z from '@deepseek-ai/schemastery'

/** One exact provider/model route, with optional adapter effort. */
export interface PoolModel {
  provider: string
  model: string
  reasoningEffort?: string
}

/** Stored plugin configuration. */
export interface Config {
  enabled: boolean | { get(): boolean }
  models: PoolModel[] | { get(): PoolModel[] }
}

/** Schemastery schema; all fields are volatile so GUI changes take effect without reload. */
export const ConfigSchema = z.object({
  enabled: z.boolean().default(true).volatile()
    .description('Enable automatic model assignment for newly created subagents.'),
  models: z.array(z.object({
    provider: z.string().required(),
    model: z.string().required(),
    reasoningEffort: z.string(),
  })).default([]).volatile()
    .description('Round-robin model pool, e.g. [{provider:"workbuddy",model:"hy4flash"}].'),
})

/** Resolve a possibly volatile value to its live value. */
export function unwrap<T>(value: T | { get(): T }): T {
  return typeof value === 'object' && value !== null && 'get' in value
    ? (value as { get(): T }).get()
    : value
}
