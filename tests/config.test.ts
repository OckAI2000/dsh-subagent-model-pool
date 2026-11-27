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

test('ConfigSchema rejects blank provider/model and blank effort values', () => {
  assert.throws(() => ConfigSchema({ models: [{ provider: '', model: 'hy4flash' }] }), /provider/)
  assert.throws(() => ConfigSchema({ models: [{ provider: 'workbuddy', model: '   ' }] }), /model/)
  assert.throws(() => ConfigSchema({ models: [{ provider: 'workbuddy', model: 'hy4flash', reasoningEffort: '  ' }] }), /reasoningEffort/)
})
