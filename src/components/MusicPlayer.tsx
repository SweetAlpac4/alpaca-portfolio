import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from 'react'
import { useLang } from '../i18n'

export type TrackName = 'overworld' | 'end'

const TRACK_FILES: Record<TrackName, string> = {
  overworld: '/audio/minecraft.mp3',
  end: '/audio/mice-on-venus.mp3',
}

export const TRACK_LABELS: Record<TrackName, string> = {
  overworld: 'Minecraft',
  end: 'Mice on Venus',
}

type MusicContextValue = {
  started: boolean
  muted: boolean
  volume: number
  available: boolean
  track: TrackName
  start: () => void
  setTrack: (track: TrackName) => void
  toggleMute: () => void
  setVolume: (value: number) => void
}

const MusicContext = createContext<MusicContextValue | null>(null)

function fade(el: HTMLAudioElement, target: number, duration = 900) {
  const from = el.volume
  const start = performance.now()
  const tick = (now: number) => {
    const k = Math.min(1, (now - start) / duration)
    el.volume = Math.max(0, Math.min(1, from + (target - from) * k))
    if (k < 1) requestAnimationFrame(tick)
  }
  requestAnimationFrame(tick)
}

export function MusicProvider({ children }: { children: ReactNode }) {
  const [started, setStarted] = useState(false)
  const [muted, setMuted] = useState(() => {
    try {
      return localStorage.getItem('portfolio-muted') === '1'
    } catch {
      return false
    }
  })
  const [volume, setVolumeState] = useState(() => {
    try {
      const raw = Number(localStorage.getItem('portfolio-volume'))
      return Number.isFinite(raw) && raw > 0 ? Math.min(1, raw) : 0.35
    } catch {
      return 0.35
    }
  })
  const [available, setAvailable] = useState(true)
  const [track, setTrackState] = useState<TrackName>('overworld')

  const aRef = useRef<HTMLAudioElement | null>(null)
  const bRef = useRef<HTMLAudioElement | null>(null)
  const activeRef = useRef<'a' | 'b'>('a')
  const startedRef = useRef(false)
  const mutedRef = useRef(muted)
  const volumeRef = useRef(volume)
  const trackRef = useRef<TrackName>('overworld')

  useEffect(() => {
    const a = new Audio()
    const b = new Audio()
    for (const el of [a, b]) {
      el.loop = true
      el.preload = 'auto'
      el.volume = 0
    }
    const onError = () => setAvailable(false)
    a.addEventListener('error', onError)
    b.addEventListener('error', onError)
    aRef.current = a
    bRef.current = b
    return () => {
      a.pause()
      b.pause()
      a.removeEventListener('error', onError)
      b.removeEventListener('error', onError)
    }
  }, [])

  useEffect(() => {
    mutedRef.current = muted
    try {
      localStorage.setItem('portfolio-muted', muted ? '1' : '0')
    } catch {
      /* ignore */
    }
  }, [muted])

  useEffect(() => {
    volumeRef.current = volume
    try {
      localStorage.setItem('portfolio-volume', String(volume))
    } catch {
      /* ignore */
    }
  }, [volume])

  const activeEl = () =>
    activeRef.current === 'a' ? aRef.current : bRef.current

  const start = useCallback(async () => {
    if (startedRef.current) return
    const el = activeEl()
    if (!el) return
    el.src = TRACK_FILES[trackRef.current]
    el.volume = 0
    try {
      await el.play()
      startedRef.current = true
      setStarted(true)
      fade(el, mutedRef.current ? 0 : volumeRef.current)
    } catch {
      setAvailable(false)
    }
  }, [])

  const setTrack = useCallback((next: TrackName) => {
    trackRef.current = next
    setTrackState(next)
    if (!startedRef.current) return
    const current = activeEl()
    const other = activeRef.current === 'a' ? bRef.current : aRef.current
    if (!current || !other) return
    if (other.src.endsWith(TRACK_FILES[next])) return
    other.src = TRACK_FILES[next]
    other.volume = 0
    other
      .play()
      .then(() => {
        const previous = activeRef.current
        activeRef.current = previous === 'a' ? 'b' : 'a'
        fade(other, mutedRef.current ? 0 : volumeRef.current)
        fade(current, 0)
        window.setTimeout(() => {
          if (activeRef.current !== previous) current.pause()
        }, 1100)
      })
      .catch(() => setAvailable(false))
  }, [])

  const toggleMute = useCallback(() => {
    if (!startedRef.current) {
      mutedRef.current = false
      setMuted(false)
      void start()
      return
    }
    setMuted((current) => !current)
  }, [start])

  const setVolume = useCallback((value: number) => {
    const clamped = Math.max(0, Math.min(1, value))
    volumeRef.current = clamped
    setVolumeState(clamped)
    if (clamped > 0) {
      mutedRef.current = false
      setMuted(false)
    }
  }, [])

  useEffect(() => {
    if (!startedRef.current) return
    const el = activeEl()
    if (!el) return
    fade(el, muted ? 0 : volume, 260)
  }, [muted, volume])

  const value = useMemo(
    () => ({
      started,
      muted,
      volume,
      available,
      track,
      start,
      setTrack,
      toggleMute,
      setVolume,
    }),
    [started, muted, volume, available, track, start, setTrack, toggleMute, setVolume],
  )

  return <MusicContext.Provider value={value}>{children}</MusicContext.Provider>
}

export function useMusic(): MusicContextValue {
  const context = useContext(MusicContext)
  if (!context) throw new Error('useMusic must be used inside MusicProvider')
  return context
}

export function MusicControls() {
  const { muted, volume, available, started, track, toggleMute, setVolume } =
    useMusic()
  const { t } = useLang()

  if (!available) return null

  const label = !started || muted ? t('unmute') : t('mute')

  return (
    <div className="music">
      <button
        type="button"
        className="music__btn"
        onClick={toggleMute}
        aria-label={label}
        title={label}
      >
        {!started || muted ? (
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="square" aria-hidden="true">
            <path d="M4 9h4l5-4v14l-5-4H4z" />
            <path d="M17 9l5 6M22 9l-5 6" />
          </svg>
        ) : (
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="square" aria-hidden="true">
            <path d="M4 9h4l5-4v14l-5-4H4z" />
            <path d="M17 8a5 5 0 0 1 0 8M20 5a9 9 0 0 1 0 14" />
          </svg>
        )}
      </button>
      <span className="music__label">{TRACK_LABELS[track]}</span>
      <input
        type="range"
        min={0}
        max={100}
        value={Math.round(volume * 100)}
        onChange={(event) => setVolume(Number(event.target.value) / 100)}
        aria-label={t('volume')}
      />
    </div>
  )
}
