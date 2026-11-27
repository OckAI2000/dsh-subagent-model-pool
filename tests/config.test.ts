import test from 'node:test'
import assert from 'node:assert/strict'
import { ConfigSchema, unwrap } from '../src/config.ts'

test('ConfigSchema defaults are disabled-free with an empty pool', () => {
  const parsed: any = ConfigSchema({})
  assert.equal(unwrap(parsed.enabled), true)
  assert.deepEqual(unwrap(parsed.models), [])
})

test('ConfigSchema accepts complete routes', () => {
  const parsed: any = ConfigSchema({ models: [{ provider: 'workbuddy', model: 'hy4flash', reasoningEffort: 'high' }] })
  assert.deepEqual(unwrap(parsed.models), [{ provider: 'workbuddy', model: 'hy4flash', reasoningEffort: 'high' }])
})
