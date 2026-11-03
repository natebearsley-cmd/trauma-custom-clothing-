export type SoundtrackSettings = { sunoUrl: string; audioUrl: string; title: string; albumArtUrl: string }
export type SoundtrackPreference = { volume: number; position: number; choice: 'played' | 'paused' }
function httpsUrl(value: string): boolean {
  try { const url = new URL(value); return url.protocol === 'https:' && !url.username && !url.password } catch { return false }
}
export function validAudioSource(value: string): boolean {
  return httpsUrl(value) || (/^\/audio\/[a-zA-Z0-9_./-]+\.(mp3|m4a|ogg|wav|webm|aac|flac)$/i.test(value) && !value.includes('..'))
}
export function validateSoundtrackSettings(value: SoundtrackSettings): void {
  if (!value || ['sunoUrl', 'audioUrl', 'title', 'albumArtUrl'].some((key) => typeof value[key as keyof SoundtrackSettings] !== 'string')) throw new Error('Invalid soundtrack settings')
  if (!httpsUrl(value.sunoUrl) || !['suno.com', 'www.suno.com'].includes(new URL(value.sunoUrl).hostname)) throw new Error('Use the real Suno HTTPS link')
  if (value.audioUrl && !validAudioSource(value.audioUrl)) throw new Error('Use an HTTPS audio URL or an /audio/ file path')
  if (value.albumArtUrl && !httpsUrl(value.albumArtUrl) && !(/^\/images\/[a-zA-Z0-9_./-]+$/.test(value.albumArtUrl) && !value.albumArtUrl.includes('..'))) throw new Error('Use the actual HTTPS artwork URL or /images/ path')
  if (value.title.length > 200) throw new Error('Song title is too long')
}
export function parseSoundtrackPreference(value: string | null): SoundtrackPreference | null {
  try {
    if (!value) return null
    const parsed = JSON.parse(value)
    if (!parsed || !Number.isFinite(parsed.volume) || parsed.volume < 0 || parsed.volume > 1 || !Number.isFinite(parsed.position) || parsed.position < 0 || !['played', 'paused'].includes(parsed.choice)) return null
    return { volume: parsed.volume, position: parsed.position, choice: parsed.choice }
  } catch { return null }
}
