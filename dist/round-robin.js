/** Pick a route from a non-empty pool; cursor is the index returned by the caller. */
export function selectRoundRobin(models, cursor) {
    if (models.length === 0)
        return undefined;
    const index = ((cursor % models.length) + models.length) % models.length;
    const picked = models[index];
    if (!picked)
        return undefined;
    return {
        provider: picked.provider,
        model: picked.model,
        ...picked.reasoningEffort ? { reasoningEffort: picked.reasoningEffort } : {},
    };
}
/** Whether an agent already has an explicit model route from its own options. */
export function hasExplicitRoute(agentOptions) {
    return Boolean(agentOptions?.provider && agentOptions?.model);
}
