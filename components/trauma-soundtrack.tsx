'use client'

import { useEffect, useRef, useState } from 'react'
import { ArrowUpRight, Disc3, Pause, Play, Volume2 } from 'lucide-react'
import { parseSoundtrackPreference, validAudioSource, type SoundtrackSettings } from '@/lib/soundtrack'

export function TraumaSoundtrack({ soundtrack }: { soundtrack: SoundtrackSettings }) {
  const audioRef = useRef<HTMLAudioElement>(null)
  const preferenceRef = useRef<{ position: number; choice: 'played' | 'paused' } | null>(null)
  const choiceRef = useRef<'played' | 'paused'>('paused')
  const [playing, setPlaying] = useState(false)
  const [volume, setVolume] = useState(0.7)
  const [message, setMessage] = useState('')
  const [artFailed, setArtFailed] = useState(false)
  const audioUrl = validAudioSource(soundtrack.audioUrl) ? soundtrack.audioUrl : ''
  const storageKey = `trauma-soundtrack:${soundtrack.sunoUrl}`
  useEffect(() => {
    try {
      const preference = parseSoundtrackPreference(sessionStorage.getItem(storageKey))
      if (preference) {
        preferenceRef.current = preference
        choiceRef.current = preference.choice
        setVolume(preference.volume)
        if (audioRef.current) audioRef.current.volume = preference.volume
        setMessage(preference.choice === 'played' ? 'Your listening preference is remembered. Press Play to resume.' : 'Paused for this session. Press Play whenever you want to listen.')
      } else if (audioRef.current) audioRef.current.volume = 0.7
    } catch { /* Playback remains usable when session storage is unavailable. */ }
    // Never call play on mount or restore: every start requires a visitor click.
  }, [storageKey])
  function remember() {
    const audio = audioRef.current
    if (!audio) return
    try { sessionStorage.setItem(storageKey, JSON.stringify({ volume: audio.volume, position: audio.currentTime, choice: choiceRef.current })) } catch { /* Optional memory must not prevent playback. */ }
  }
  async function play() {
    const audio = audioRef.current
    if (!audio || !audioUrl) return
    setMessage('')
    try { await audio.play() } catch { setPlaying(false); setMessage('The track could not start. You can listen using the Suno link below.') }
  }
  function pause() {
    audioRef.current?.pause()
    choiceRef.current = 'paused'
    setPlaying(false)
    remember()
  }
  return <aside id="soundtrack" aria-labelledby="soundtrack-heading" className="mt-8 min-w-0 border border-border bg-card p-5 md:p-6">
    <h3 id="soundtrack-heading" className="font-display text-3xl uppercase">🎵 TRAUMA Soundtrack</h3>
    <p className="mt-3 text-sm leading-relaxed text-muted-foreground">Listen to the music behind the movement.</p>
    {soundtrack.albumArtUrl && !artFailed && (
      // eslint-disable-next-line @next/next/no-img-element
      <img src={soundtrack.albumArtUrl} alt={soundtrack.title ? `${soundtrack.title} album art` : 'TRAUMA soundtrack album art'} onError={() => setArtFailed(true)} referrerPolicy="no-referrer" className="mt-5 aspect-square w-full max-w-xs object-contain" />
    )}
    {(!soundtrack.albumArtUrl || artFailed) && <div role="img" aria-label="Album artwork coming soon" className="mt-5 flex aspect-square w-full max-w-xs flex-col items-center justify-center gap-4 border border-border bg-background p-6 text-center text-muted-foreground"><Disc3 className="size-16" aria-hidden="true" /><span className="text-xs uppercase tracking-widest">Album artwork coming soon</span></div>}
    <p className="mt-5 break-words text-lg font-semibold">{soundtrack.title || 'Song title coming soon'}</p>
    {audioUrl && <audio ref={audioRef} src={audioUrl} preload="none" aria-label={soundtrack.title || 'TRAUMA Soundtrack'}
      onLoadedMetadata={() => { const audio = audioRef.current; if (audio && preferenceRef.current && Number.isFinite(audio.duration)) audio.currentTime = Math.min(preferenceRef.current.position, Math.max(0, audio.duration - 0.1)) }}
      onPlaying={() => { choiceRef.current = 'played'; setPlaying(true); setMessage('Playing.'); remember() }}
      onPause={() => { setPlaying(false); choiceRef.current = 'paused'; remember() }}
      onEnded={() => { setPlaying(false); choiceRef.current = 'paused'; remember() }}
      onTimeUpdate={remember}
      onError={() => { setPlaying(false); setMessage('The audio could not load. Use the Suno link to listen.') }} />}
    <div className="mt-5 flex flex-wrap gap-3">
      <button type="button" disabled={!audioUrl || playing} onClick={play} className="inline-flex min-h-12 items-center gap-2 bg-primary px-5 py-3 text-sm font-semibold text-primary-foreground hover:bg-accent disabled:opacity-50"><Play className="size-4" aria-hidden="true" />Play</button>
      <button type="button" disabled={!audioUrl || !playing} onClick={pause} className="inline-flex min-h-12 items-center gap-2 border border-input px-5 py-3 text-sm font-semibold hover:border-accent disabled:opacity-50"><Pause className="size-4" aria-hidden="true" />Pause</button>
    </div>
    <label className="mt-5 block text-sm" htmlFor="soundtrack-volume"><span className="flex items-center gap-2"><Volume2 className="size-4" aria-hidden="true" />Volume · {Math.round(volume * 100)}%</span><input id="soundtrack-volume" type="range" min="0" max="1" step="0.05" value={volume} disabled={!audioUrl} onChange={(event) => { const next = Number(event.target.value); setVolume(next); if (audioRef.current) audioRef.current.volume = next; remember() }} className="mt-2 min-h-11 w-full accent-[var(--accent)]" /></label>
    {!audioUrl && <p className="mt-3 text-sm leading-relaxed text-muted-foreground">Coming Soon — in-page audio integration. Listen on Suno now. No audio plays automatically.</p>}
    <p role="status" aria-live="polite" className="mt-3 text-sm text-muted-foreground">{message}</p>
    <a href={soundtrack.sunoUrl} target="_blank" rel="noopener noreferrer" className="mt-4 inline-flex min-h-11 items-center gap-2 text-sm underline underline-offset-4">Listen On Suno<ArrowUpRight className="size-4" aria-hidden="true" /><span className="sr-only"> (opens in new tab)</span></a>
  </aside>
}
