/**
 * dsh-subagent-model-pool client half:
 * settings.section page for managing enabled + model pool via configForms.
 * No build step; hand-written lazy-CJS wrapper for window.__ModuleLoader__.
 */
window.__ModuleLoader__.load({
  id: 'dsh-subagent-model-pool',
  factory(require) {
    const React = require('react')
    const h = React.createElement
    const useState = React.useState
    const useEffect = React.useEffect
    const NS = 'dsh-subagent-model-pool'
    const NS_CANDIDATES = [NS, 'include:' + NS]
    const SECTION_ID = 'dsh-subagent-model-pool'
    const ZH = typeof navigator !== 'undefined' && /^zh/i.test(navigator.language || '')
    const tr = (zh, en) => ZH ? zh : en

    const STYLE_ID = 'dsh-subagent-model-pool-style'
    const CSS = `
.sp-page{display:flex;flex-direction:column;gap:14px;max-width:820px;font-size:13px;line-height:1.5}
.sp-card{border:1px solid var(--dsw-alias-border-l2,rgba(128,128,128,.22));border-radius:10px;padding:14px;display:flex;flex-direction:column;gap:10px}
.sp-title{font-size:15px;font-weight:600;color:var(--dsw-alias-label-primary,#e6e8eb)}
.sp-sub{color:var(--dsw-alias-label-secondary,#8a8f98);font-size:12px}
.sp-row{display:flex;align-items:center;justify-content:space-between;gap:12px}
.sp-label{display:flex;flex-direction:column;gap:2px;min-width:0}
.sp-input,.sp-select{appearance:none;background:var(--dsw-alias-bg-body,#fff);color:var(--dsw-alias-label-primary,#1f2329);border:1px solid var(--dsw-alias-border-l2,rgba(128,128,128,.35));border-radius:6px;padding:5px 8px;font-family:inherit;font-size:12px;min-width:0;width:100%}
.sp-btn{appearance:none;border:1px solid var(--dsw-alias-border-l2,rgba(128,128,128,.35));background:var(--dsw-alias-interactive-bg,rgba(128,128,128,.08));color:var(--dsw-alias-label-primary,#e6e8eb);border-radius:6px;padding:5px 9px;cursor:pointer;font-family:inherit;font-size:12px;white-space:nowrap}
.sp-btn:disabled{opacity:.5;cursor:not-allowed}
.sp-btn--danger{color:#d03050}
.sp-editor{display:grid;grid-template-columns:minmax(120px,1fr) minmax(120px,1fr) 110px auto;gap:8px;align-items:center;padding:8px 0;border-bottom:1px solid var(--dsw-alias-border-l2,rgba(128,128,128,.15))}
.sp-monospace{font-family:ui-monospace,SFMono-Regular,Menlo,monospace}
.sp-actions{display:flex;gap:6px;justify-content:flex-end;flex-wrap:wrap}
.sp-note{color:var(--dsw-alias-label-secondary,#8a8f98)}
.sp-bad{color:#d03050}
`
    function injectStyle() {
      if (typeof document === 'undefined' || document.getElementById(STYLE_ID)) return
      const el = document.createElement('style')
      el.id = STYLE_ID
      el.textContent = CSS
      document.head.appendChild(el)
    }

    function safe(Component) {
      class Boundary extends React.Component {
        constructor(props) { super(props); this.state = { error: null } }
        static getDerivedStateFromError(error) { return { error } }
        render() { return this.state.error ? null : h(Component, this.props) }
      }
      Boundary.displayName = `Safe(${Component.displayName ?? Component.name ?? 'Component'})`
      return Boundary
    }

    function nonEmpty(value) {
      return typeof value === 'string' && value !== '' ? value : undefined
    }

    function record(value) {
      return typeof value === 'object' && value !== null && !Array.isArray(value) ? value : undefined
    }

    function unwrapRpc(res) {
      if (!res) return undefined
      const inner = record(res.result)
      if (inner) {
        if (inner.ok === false) return undefined
        if ('value' in inner) return inner.value
      }
      if (res.ok === false) return undefined
      if ('value' in res) return res.value
      return res
    }

    function effortIdsOf(reasoning) {
      const efforts = []
      for (const entry of Array.isArray(record(reasoning)?.efforts) ? reasoning.efforts : []) {
        const id = typeof entry === 'string' ? nonEmpty(entry) : nonEmpty(record(entry)?.id)
        if (id && !efforts.includes(id)) efforts.push(id)
      }
      return efforts
    }

    function emptyCatalog() {
      return { providers: [], byProvider: Object.create(null), default: {}, source: '', loading: false, error: '' }
    }

    function catalogFromModelCatalog(value) {
      const root = record(value) || {}
      const providers = []
      const byProvider = Object.create(null)
      for (const entry of Array.isArray(root.groups) ? root.groups : []) {
        const group = record(entry)
        if (!group) continue
        const provider = nonEmpty(group.id) || nonEmpty(group.provider)
        if (!provider) continue
        let bucket = byProvider[provider]
        if (!bucket) {
          bucket = { id: provider, name: nonEmpty(group.name) || provider, models: [] }
          byProvider[provider] = bucket
          providers.push(bucket)
        }
        for (const item of Array.isArray(group.models) ? group.models : []) {
          const model = record(item)
          const id = nonEmpty(model?.id)
          if (!model || !id) continue
          bucket.models.push({ id, name: nonEmpty(model.name) || id, efforts: effortIdsOf(model.reasoning) })
        }
      }
      const selected = record(root.default) || {}
      return {
        providers,
        byProvider,
        default: {
          provider: nonEmpty(selected.provider),
          model: nonEmpty(selected.model),
          reasoningEffort: nonEmpty(selected.reasoningEffort),
        },
        source: '',
        loading: false,
        error: '',
      }
    }

    function catalogFromDiscovered(value) {
      const root = record(value) || {}
      const list = Array.isArray(value) ? value : Array.isArray(root.models) ? root.models : []
      const providers = []
      const byProvider = Object.create(null)
      for (const item of list) {
        const model = record(item)
        if (!model) continue
        let provider = nonEmpty(model.provider)
        let id = nonEmpty(model.id)
        if (!provider && id && id.includes('/')) {
          provider = nonEmpty(id.slice(0, id.indexOf('/')))
          id = nonEmpty(id.slice(id.indexOf('/') + 1))
        }
        if (!provider || !id) continue
        let bucket = byProvider[provider]
        if (!bucket) {
          bucket = { id: provider, name: provider, models: [] }
          byProvider[provider] = bucket
          providers.push(bucket)
        }
        if (!bucket.models.some((row) => row.id === id)) {
          bucket.models.push({ id, name: nonEmpty(model.name) || id, efforts: effortIdsOf(model.reasoning) })
        }
      }
      return { providers, byProvider, default: {}, source: '', loading: false, error: '' }
    }

    function remoteSessionFace(ctx) {
      for (const name of ['remote.session', 'remote']) {
        let candidate
        try { candidate = ctx.get(name) } catch { continue }
        if (typeof candidate?.modelCatalog === 'function') return candidate
        if (typeof candidate?.session?.modelCatalog === 'function') return candidate.session
      }
      return undefined
    }

    async function loadCatalog(ctx) {
      let lastError = ''
      try {
        const face = remoteSessionFace(ctx)
        if (face) {
          const res = await face.modelCatalog()
          const value = unwrapRpc(res)
          const catalog = catalogFromModelCatalog(value)
          if (catalog.providers.length > 0) return { ...catalog, source: 'remote.session' }
        }
      } catch (error) { lastError = String(error?.message || error) }

      try {
        const conn = ctx.get('connection')
        const api = conn?.api
        if (typeof api?.llm?.discoverModels === 'function') {
          const catalog = catalogFromDiscovered(unwrapRpc(await api.llm.discoverModels()))
          if (catalog.providers.length > 0) return { ...catalog, source: 'connection.llm' }
        }
        const catalogFn = typeof api?.session?.modelCatalog === 'function' ? api.session.modelCatalog
          : typeof api?.sessions?.modelCatalog === 'function' ? api.sessions.modelCatalog
          : undefined
        if (catalogFn) {
          const catalog = catalogFromModelCatalog(unwrapRpc(await catalogFn()))
          if (catalog.providers.length > 0) return { ...catalog, source: 'connection.session' }
        }
      } catch (error) { lastError = lastError || String(error?.message || error) }

      return { ...emptyCatalog(), error: lastError || tr('未获取到模型候选；可刷新重试。', 'No model candidates; refresh to retry.') }
    }

    function normalizeModels(value) {
      if (!Array.isArray(value)) return []
      return value.map((row) => ({
        provider: typeof row?.provider === 'string' ? row.provider : '',
        model: typeof row?.model === 'string' ? row.model : '',
        reasoningEffort: typeof row?.reasoningEffort === 'string' ? row.reasoningEffort : '',
      }))
    }

    function isRowComplete(row) {
      return !!(row.provider && row.model)
    }

    function rowsValid(rows) {
      return rows.length === 0 || rows.every(isRowComplete)
    }

    function labeled(value, name) {
      return value && name && name !== value ? `${name} (${value})` : value
    }

    function withCurrent(options, current, label) {
      const value = nonEmpty(current)
      if (!value || options.some((item) => item.value === value)) return options
      return [{ value, label: `${label}: ${value}` }, ...options]
    }

    function providerOptions(catalog, current) {
      const options = (catalog.providers || []).map((p) => ({ value: p.id, label: labeled(p.id, p.name) }))
      if (current === '') options.unshift({ value: '', label: tr('未选择（无效）', 'Not selected (invalid)') })
      return withCurrent(options, current, tr('当前值', 'Current'))
    }

    function modelOptions(catalog, provider, current) {
      const bucket = catalog.byProvider?.[provider]
      const options = (bucket?.models || []).map((m) => ({ value: m.id, label: labeled(m.id, m.name) }))
      if (current === '') options.unshift({ value: '', label: tr('未选择（无效）', 'Not selected (invalid)') })
      return withCurrent(options, current, tr('当前值', 'Current'))
    }

    function effortOptions(catalog, provider, model, current) {
      const options = [{ value: '', label: tr('默认（不设置）', 'Default (unset)') }]
      const bucket = catalog.byProvider?.[provider]
      const picked = bucket?.models?.find((m) => m.id === model)
      for (const effort of picked?.efforts || []) options.push({ value: effort, label: effort })
      return withCurrent(options, current, tr('当前值', 'Current'))
    }

    function renderOptions(options) {
      return options.map((item) => h('option', { key: item.value, value: item.value }, item.label))
    }

    function Switch(props) {
      return h('button', {
        type: 'button',
        className: 'sp-btn',
        disabled: props.disabled,
        onClick: () => props.onChange(!props.checked),
      }, props.checked ? tr('已启用', 'Enabled') : tr('已关闭', 'Disabled'))
    }

    function SettingsPage(props) {
      const face = props.face
      const snap = face?.form?.getSnapshot?.()
      const value = snap?.value || {}
      const writable = !!snap && snap.writable !== false
      const catalog = face?.catalog || emptyCatalog()
      const catalogReady = catalog.providers.length > 0
      const [draft, setDraft] = useState(null)
      const [pending, setPending] = useState(false)
      const [error, setError] = useState('')
      const models = normalizeModels(draft ? draft.models : value.models)
      const enabled = draft ? draft.enabled : value.enabled !== false

      useEffect(() => { face?.refreshCatalog?.() }, [face])

      const write = async (field, val) => {
        const form = face?.form
        if (!form || !writable) return
        setPending(true); setError('')
        try { await form.set(field, val) }
        catch (e) { setError(String(e?.message || e)) }
        finally { setPending(false) }
      }

      const updateModels = (next) => setDraft({ enabled, models: next })

      const move = (index, delta) => {
        const next = models.slice()
        const target = index + delta
        if (target < 0 || target >= next.length) return
        const current = next[index]
        next[index] = next[target]
        next[target] = current
        updateModels(next)
      }

      const addRow = () => {
        const picked = catalog.default || {}
        const provider = nonEmpty(picked.provider) || catalog.providers[0]?.id || ''
        const bucket = catalog.byProvider?.[provider]
        const model = nonEmpty(picked.model) && bucket?.models?.some((m) => m.id === picked.model)
          ? picked.model
          : bucket?.models?.[0]?.id || ''
        updateModels([...models, { provider, model, reasoningEffort: nonEmpty(picked.reasoningEffort) || '' }])
      }

      return h('div', { className: 'sp-page' },
        h('div', {},
          h('div', { className: 'sp-title' }, tr('子智能体模型池', 'Subagent Model Pool')),
          h('div', { className: 'sp-sub' }, tr('新子 agent 按以下顺序轮询；即使 delegation 显式指定或继承了模型，也会由本池覆盖。', 'New subagents cycle through this pool; explicit or inherited delegation routes are always overridden.')),
        ),
        !face?.form ? h('div', { className: 'sp-bad' }, tr('配置服务不可用；本页只读。', 'Config service unavailable; read-only.')) : null,
        error ? h('div', { className: 'sp-bad' }, error) : null,
        h('div', { className: 'sp-card' },
          h('div', { className: 'sp-row' },
            h('div', { className: 'sp-label' },
              h('div', {}, tr('启用自动分配', 'Enable auto assignment')),
              h('div', { className: 'sp-sub' }, tr('关闭后插件不修改任何子 agent。', 'Disabled means no child agent is modified.')),
            ),
            h(Switch, { checked: enabled, disabled: !writable || pending, onChange: (v) => {
              if (draft) setDraft({ ...draft, enabled: v })
              else write('enabled', v)
            } }),
          ),
          draft && draft.enabled !== enabled ? h('div', { className: 'sp-actions' },
            h('button', { className: 'sp-btn', disabled: pending, onClick: () => write('enabled', draft.enabled) }, tr('保存开关', 'Save toggle')),
            h('button', { className: 'sp-btn', disabled: pending, onClick: () => setDraft(null) }, tr('取消', 'Cancel')),
          ) : null,
        ),
        h('div', { className: 'sp-card' },
          h('div', { className: 'sp-row' },
            h('div', { className: 'sp-title' }, tr('模型池', 'Model pool')),
            h('div', { className: 'sp-actions' },
              h('button', { className: 'sp-btn', disabled: !writable || pending || !catalogReady, onClick: addRow }, tr('新增', 'Add')),
              h('button', { className: 'sp-btn', disabled: !writable || pending || !draft || !rowsValid(models), onClick: () => write('models', models) }, tr('保存', 'Save')),
              h('button', { className: 'sp-btn', disabled: !writable || pending || !draft, onClick: () => setDraft(null) }, tr('取消', 'Cancel')),
              h('button', { className: 'sp-btn', disabled: pending, onClick: () => face?.refreshCatalog?.() }, tr('刷新候选', 'Refresh options')),
            ),
          ),
          h('div', { className: 'sp-sub' }, tr('从当前连接读取可选 provider / model / reasoningEffort；provider 与 model 必填，effort 留空使用模型默认值。', 'Provider / model / reasoningEffort are read from the current connection; provider and model are required, empty effort uses the model default.')),
          catalog.loading ? h('div', { className: 'sp-note' }, tr('正在读取模型候选…', 'Loading model candidates…')) : null,
          !catalog.loading && !catalogReady ? h('div', { className: 'sp-note' }, catalog.error || tr('暂无模型候选。', 'No model candidates yet.')) : null,
          !rowsValid(models) ? h('div', { className: 'sp-bad' }, tr('存在未选完整的新增行：provider 和 model 都选择后才能保存。', 'A row is incomplete: choose both provider and model before saving.')) : null,
          h('div', { className: 'sp-editor', style: { fontWeight: 600 } },
            h('div', {}, 'provider'), h('div', {}, 'model'), h('div', {}, 'reasoningEffort'), h('div', {}),
          ),
          ...models.map((row, index) => h('div', { className: 'sp-editor', key: index },
            h('select', {
              className: 'sp-select sp-monospace', value: row.provider,
              disabled: !writable || pending,
              onChange: (e) => { const next = models.slice(); next[index] = { ...row, provider: e.target.value, model: '', reasoningEffort: '' }; updateModels(next) },
            }, renderOptions(providerOptions(catalog, row.provider))),
            h('select', {
              className: 'sp-select sp-monospace', value: row.model,
              disabled: !writable || pending || !row.provider,
              onChange: (e) => { const next = models.slice(); next[index] = { ...row, model: e.target.value, reasoningEffort: '' }; updateModels(next) },
            }, renderOptions(modelOptions(catalog, row.provider, row.model))),
            h('select', {
              className: 'sp-select sp-monospace', value: row.reasoningEffort,
              disabled: !writable || pending || !row.model,
              onChange: (e) => { const next = models.slice(); next[index] = { ...row, reasoningEffort: e.target.value }; updateModels(next) },
            }, renderOptions(effortOptions(catalog, row.provider, row.model, row.reasoningEffort))),
            h('div', { className: 'sp-actions' },
              h('button', { className: 'sp-btn', disabled: !writable || pending || index === 0, onClick: () => move(index, -1) }, '↑'),
              h('button', { className: 'sp-btn', disabled: !writable || pending || index === models.length - 1, onClick: () => move(index, 1) }, '↓'),
              h('button', { className: 'sp-btn sp-btn--danger', disabled: !writable || pending, onClick: () => updateModels(models.filter((_, i) => i !== index)) }, tr('删除', 'Delete')),
            ),
          )),
          models.length === 0 ? h('div', { className: 'sp-note' }, tr('池为空：插件不会在新子 agent 上设置模型。', 'Empty pool: no model is set on new subagents.')) : null,
        ),
      )
    }

    return {
      inject: ['slots'],
      apply(ctx) {
        injectStyle()
        const listeners = new Set()
        const face = {
          form: undefined,
          catalog: { ...emptyCatalog(), loading: true },
          subscribe(fn) { listeners.add(fn); return () => listeners.delete(fn) },
          emit() { for (const fn of listeners) { try { fn() } catch {} } },
        }
        const refreshCatalog = async () => {
          face.catalog = { ...face.catalog, loading: true, error: '' }
          face.emit()
          const next = await loadCatalog(ctx)
          face.catalog = next
          face.emit()
        }
        face.refreshCatalog = refreshCatalog
        ctx.inject(['configForms'], (fctx) => {
          const forms = fctx.configForms
          if (!forms) return
          ctx.effect(() => forms.whileServed(NS_CANDIDATES, (served) => {
            const ns = NS_CANDIDATES.find((n) => served.has(n)) || [...served].find((n) => /subagent-model-pool/i.test(n))
            face.form = ns && forms.get ? forms.get(ns) : undefined
            face.emit()
            return () => { face.form = undefined; face.emit() }
          }), 'dsh-subagent-model-pool: config form binding')
        })
        ctx.effect(() => {
          refreshCatalog()
          return ctx.on('connection/reset', () => { refreshCatalog() })
        }, 'dsh-subagent-model-pool: model catalog')
        const reg = ctx.slots.inject('settings.section', () => {
          const disposers = []
          disposers.push(ctx.slots.register({
            name: 'settings.section',
            id: SECTION_ID,
            order: 36,
            label: () => tr('子模型池', 'Subagent Pool'),
            inject: () => ({ face }),
          }, safe(SettingsPage)))
          try {
            const iconReg = ctx.slots.inject('settings.section.icon', () => ctx.slots.register({
              name: 'settings.section.icon',
              id: SECTION_ID,
            }, (iconProps) => {
              const edge = typeof iconProps?.size === 'number' ? iconProps.size : 16
              return h('div', {
                style: {
                  width: edge, height: edge, borderRadius: 4,
                  background: 'linear-gradient(135deg,#16a34a,#0ea5e9)', color: '#fff',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontWeight: 700, fontSize: Math.round(edge * 0.55),
                },
              }, 'A')
            }))
            if (typeof iconReg === 'function') disposers.push(iconReg)
          } catch {}
          return () => disposers.forEach((d) => { try { d() } catch {} })
        })
        if (typeof reg === 'function') ctx.effect(() => reg)
      },
    }
  },
})
