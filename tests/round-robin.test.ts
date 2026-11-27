import test from 'node:test'
import assert from 'node:assert/strict'
import { selectRoundRobin, hasExplicitRoute } from '../src/round-robin.ts'

test('selectRoundRobin cycles A, B, C, A', () => {
  const models = [
    { provider: 'p', model: 'A' },
    { provider: 'p', model: 'B' },
    { provider: 'p', model: 'C' },
  ]
  assert.deepEqual(selectRoundRobin(models, 0), { provider: 'p', model: 'A' })
  assert.deepEqual(selectRoundRobin(models, 1), { provider: 'p', model: 'B' })
  assert.deepEqual(selectRoundRobin(models, 2), { provider: 'p', model: 'C' })
  assert.deepEqual(selectRoundRobin(models, 3), { provider: 'p', model: 'A' })
})

test('selectRoundRobin preserves optional reasoning effort', () => {
  assert.deepEqual(selectRoundRobin([{ provider: 'p', model: 'A', reasoningEffort: 'high' }], 0), {
    provider: 'p', model: 'A', reasoningEffort: 'high',
  })
})

test('selectRoundRobin returns undefined for empty pool or invalid cursor', () => {
  assert.equal(selectRoundRobin([], 0), undefined)
  assert.deepEqual(selectRoundRobin([{ provider: 'p', model: 'A' }], -1), { provider: 'p', model: 'A' })
})

test('hasExplicitRoute only accepts a complete route', () => {
  assert.equal(hasExplicitRoute(undefined), false)
  assert.equal(hasExplicitRoute({}), false)
  assert.equal(hasExplicitRoute({ provider: 'p' }), false)
  assert.equal(hasExplicitRoute({ model: 'm' }), false)
  assert.equal(hasExplicitRoute({ provider: 'p', model: 'm' }), true)
})

test('an explicit child route is still a valid input to round-robin selection', () => {
  const explicitChildOptions = { provider: 'workbuddy-global-vision', model: 'hy3' }
  assert.equal(hasExplicitRoute(explicitChildOptions), true)
  const pool = [{ provider: 'workbuddy', model: 'hy4flash' }]
  const picked = selectRoundRobin(pool, 0)
  assert.ok(picked)
  assert.notEqual(picked.provider, explicitChildOptions.provider)
  assert.notEqual(picked.model, explicitChildOptions.model)
})