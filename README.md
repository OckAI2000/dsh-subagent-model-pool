# dsh-subagent-model-pool

Independent DSH Cordis plugin that assigns newly created subagents to models from a plugin-owned pool using round-robin. It does not fork or modify `@deepseek-ai/dsh-tool-subagent`.

## Behavior

- Listens to the serial `agent/created` event and calls `agent.model.select()` before the child agent loop starts.
- Applies only to fresh subagent sessions (`agent.session.header.origin === 'subagent'`, `source === 'startup'`).
- Pool assignment wins over routes inherited from the parent or supplied by an explicit `subagent` tool call.
- Omitting `reasoningEffort` keeps the adapter/provider default.
- Cursor state is process-local; DSH restart resets it to the first pool entry.
- No automatic 429 failover is included.

## Configuration

```yaml
- id: dsh-subagent-model-pool
  config:
    enabled: true
    models:
      - provider: workbuddy
        model: hy4flash
        reasoningEffort: high
      - provider: workbuddy-global
        model: hy4flash-free
```

## Installation from GitHub

```bash
dsh plugin --profile web add github:OckAI2000/dsh-subagent-model-pool
```

Restart DSH after installation. The GitHub package publishes a compiled JavaScript entrypoint in `dist/`; no local build step is needed after installation. The package metadata declares the bundle patch, so the `dsh-subagent-model-pool` row can be enabled or disabled from **Plugins → Installed** like other bundles. Pin a commit when reproducibility matters:

```bash
dsh plugin --profile web add github:OckAI2000/dsh-subagent-model-pool#<commit-sha>
```

## Local deployment

```bash
ln -s "$HOME/AI/dsh-subagent-model-pool" ~/.dsh/profiles/web/node_modules/dsh-subagent-model-pool
```

Add the `cordis.patch.yml` insert entry to the active profile, then restart DSH for a full module reload. Disable/enable alone keeps the old ESM module cached.

## Settings UI

After deploying the client half (`client.js` + `dsh.client` in `package.json`), open **Settings → Subagent Pool**. The page toggles the plugin and edits/saves the model pool using candidate dropdowns loaded from the current DSH connection (`remote.session.modelCatalog`, with `llm/discoverModels` fallback). Each row selects provider, model and optional reasoningEffort; unsupported saved values are kept as explicit options. Writes go through DSH `configForms` to the plugin namespace and are volatile (effective immediately). After installation from GitHub, the bundle and its row appear under **Plugins → Installed**, where DSH provides the enable/disable switches. A browser refresh is required after changing `client.js`; changing `package.json` client inject metadata may require a DSH host restart. If the config service is unavailable, the page becomes read-only.