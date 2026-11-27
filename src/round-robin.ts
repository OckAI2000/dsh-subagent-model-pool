/** Stateless route selection helpers, kept separate from Cordis lifecycle wiring.
 *
 * `hasExplicitRoute` is retained only for diagnostics/tests; the plugin no longer uses it
 * to skip agents because DSH always merges a parent/explicit route into child options.
 */
import type { PoolModel } from './config.ts'

export interface SelectedRoute {
  provider: string
  model: string
  reasoningEffort?: string
}

/** Pick a route from a non-empty pool; cursor is the index returned by the caller. */
export function selectRoundRobin(models: readonly PoolModel[], cursor: number): SelectedRoute | undefined {
  if (models.length === 0) return undefined
  const index = ((cursor % models.length) + models.length) % models.length
  const picked = models[index]
  if (!picked) return undefined
  return {
    provider: picked.provider,
    model: picked.model,
    ...picked.reasoningEffort ? { reasoningEffort: picked.reasoningEffort } : {},
  }
}

/** Whether an agent already has an explicit model route from its own options. */
export function hasExplicitRoute(agentOptions: {
  provider?: string
  model?: string
} | undefined): boolean {
  return Boolean(agentOptions?.provider && agentOptions?.model)
}
