import test from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { parseSoundtrackPreference, validateSoundtrackSettings, validAudioSource } from '../lib/soundtrack.ts'
const soundtrack = JSON.parse(readFileSync(new URL('../data/soundtrack.json', import.meta.url)))
test('soundtrack retains the exact Suno link and never invents unavailable media', () => {
  validateSoundtrackSettings(soundtrack)
  assert.equal(soundtrack.sunoUrl, 'https://suno.com/s/pDc89tDQEs4NVO9P')
  assert.equal(soundtrack.audioUrl, '')
  assert.equal(soundtrack.albumArtUrl, '')
  assert.equal(soundtrack.title, '')
  assert.equal(validAudioSource('/audio/track.mp3'), true)
  assert.equal(validAudioSource('javascript:alert(1)'), false)
  assert.equal(validAudioSource('/audio/../secret.mp3'), false)
  assert.throws(() => validateSoundtrackSettings({ ...soundtrack, audioUrl: 'javascript:alert(1)' }))
  assert.throws(() => validateSoundtrackSettings({ ...soundtrack, albumArtUrl: '/images/../secret.png' }))
})
test('session preferences validate volume, position and the visitor playback choice', () => {
  const preference = { volume: 0.3, position: 24, choice: 'paused' }
  assert.deepEqual(parseSoundtrackPreference(JSON.stringify(preference)), preference)
  for (const value of [null, '', 'invalid', 'null', '{}', '{"volume":2,"position":0,"choice":"played"}', '{"volume":0.3,"position":-1,"choice":"played"}', '{"volume":0.3,"position":0,"choice":"autoplay"}'])
    assert.equal(parseSoundtrackPreference(value), null)
})
