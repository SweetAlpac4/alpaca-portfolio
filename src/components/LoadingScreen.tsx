import { useEffect, useRef, useState } from 'react'
import { useLang } from '../i18n'

type Props = {
  ready: boolean
  onPlay: () => void
  onEnter: () => void
}

const TIP_KEYS = [
  'loading_tip_1',
  'loading_tip_2',
  'loading_tip_3',
  'loading_tip_4',
  'loading_tip_5',
] as const

export function LoadingScreen({ ready, onPlay, onEnter }: Props) {
  const { t } = useLang()
  const [progress, setProgress] = useState(0)
  const [tipIndex, setTipIndex] = useState(0)
  const [leaving, setLeaving] = useState(false)
  const [forced, setForced] = useState(false)
  const startedAt = useRef(Date.now())

  useEffect(() => {
    const interval = window.setInterval(() => {
      setProgress((current) => {
        if (current >= 92) return current
        const step = current < 40 ? 6 : current < 70 ? 3 : 1
        return Math.min(92, current + step)
      })
    }, 140)
    return () => window.clearInterval(interval)
  }, [])

  useEffect(() => {
    const tipInterval = window.setInterval(() => {
      setTipIndex((current) => (current + 1) % TIP_KEYS.length)
    }, 2600)
    return () => window.clearInterval(tipInterval)
  }, [])

  useEffect(() => {
    const timeout = window.setTimeout(() => setForced(true), 6500)
    return () => window.clearTimeout(timeout)
  }, [])

  const canFinish = ready || forced

  useEffect(() => {
    if (!canFinish) return
    const elapsed = Date.now() - startedAt.current
    const remaining = Math.max(0, 1700 - elapsed)
    const timeout = window.setTimeout(() => setProgress(100), remaining)
    return () => window.clearTimeout(timeout)
  }, [canFinish])

  const done = progress >= 100
  const stage =
    progress < 30
      ? t('loading_terrain')
      : progress < 65
        ? t('loading_entities')
        : progress < 100
          ? t('loading_spawn')
          : t('loading_done')

  const enter = () => {
    if (leaving) return
    onPlay()
    setLeaving(true)
    window.setTimeout(onEnter, 480)
  }

  return (
    <div
      className={`loading${leaving ? ' loading--leaving' : ''}`}
      role="dialog"
      aria-modal="true"
      aria-label={t('loading_world')}
    >
      <div className="loading__panel">
        <h1 className="loading__logo">PORTFOLIO</h1>
        <p className="loading__sub">{t('loading_world')}</p>

        <p className="loading__stage" aria-live="polite">
          {stage}
        </p>

        <div
          className="loading__bar"
          role="progressbar"
          aria-valuemin={0}
          aria-valuemax={100}
          aria-valuenow={progress}
          aria-label={t('loading_world')}
        >
          <div className="loading__fill" style={{ width: `${progress}%` }} />
        </div>
        <p className="loading__pct">{progress}%</p>

        <p className="loading__tip">{t(TIP_KEYS[tipIndex])}</p>

        {done && (
          <button className="mc-btn loading__play" onClick={enter} autoFocus>
            {t('click_to_play')}
          </button>
        )}
      </div>

      <p className="loading__meta">Portfolio Edition 1.0</p>
      <p className="loading__meta loading__meta--right">
        Not affiliated with Mojang
      </p>
    </div>
  )
}
