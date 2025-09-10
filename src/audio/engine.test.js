import { test } from 'node:test'
import assert from 'node:assert/strict'
import { audible, __setTracksForTest } from './engine.js'

test('audible respects soloed tracks', () => {
  const mockTracks = [
    { muted: false, solo: false },
    { muted: false, solo: true },
    { muted: false, solo: false }
  ]
  __setTracksForTest(mockTracks)
  assert.equal(audible(0), false)
  assert.equal(audible(1), true)
  assert.equal(audible(2), false)
})
