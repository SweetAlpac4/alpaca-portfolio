import { useEffect, useRef, useState } from 'react'
import type { Localized } from '../data/types'
import { useLang } from '../i18n'
import { HiddenItem } from '../components/HiddenItem'
import { useAchievements } from '../components/AchievementProvider'
import { canReadAfterword } from '../lib/features'

type Props = {
  name: string
  role: string
  credits: Localized
  active: boolean
  onRespawn: () => void
}

export function Credits({ name, role, credits, active, onRespawn }: Props) {
  const { t } = useLang()

  return (
    <section
      id="credits"
      className={`biome biome--credits${active ? ' is-active' : ''}`}
    >
      <div className="stars" aria-hidden="true" />
      <HiddenItem section="credits" />

      <CreditsRoll key={active ? 'visit' : 'idle'} name={name} role={role} credits={credits} active={active} />

      <div className="credits__actions">
        <button className="mc-btn" onClick={onRespawn}>
          {t('back_to_top')}
        </button>
      </div>
    </section>
  )
}

function CreditsRoll({ name, role, credits, active }: Omit<Props, 'onRespawn'>) {
  const { t, pick } = useLang()
  const { unlocked } = useAchievements()
  const eligible = canReadAfterword(unlocked)
  const viewport = useRef<HTMLDivElement>(null)
  const lastLine = useRef<HTMLParagraphElement>(null)
  const [finished, setFinished] = useState(false)
  const [showLetter, setShowLetter] = useState(false)

  // With reduced motion the player reads the credits by scrolling to the last line.
  useEffect(() => {
    if (!active || !eligible || finished || !lastLine.current) return
    const motion = window.matchMedia('(prefers-reduced-motion: reduce)')
    const observer = new IntersectionObserver(([entry]) => {
      if (motion.matches && entry.intersectionRatio >= 1) setFinished(true)
    }, { root: viewport.current, threshold: 1 })
    const observe = () => {
      observer.disconnect()
      if (motion.matches && lastLine.current) observer.observe(lastLine.current)
    }
    observe()
    motion.addEventListener('change', observe)
    return () => { observer.disconnect(); motion.removeEventListener('change', observe) }
  }, [active, eligible, finished])

  useEffect(() => {
    if (!eligible) {
      setFinished(false)
      setShowLetter(false)
      return
    }
    if (!active || !finished) return
    let remaining = 15_000
    let started = performance.now()
    let timer: number | undefined
    function sync() {
      if (timer !== undefined) {
        window.clearTimeout(timer)
        remaining -= performance.now() - started
        timer = undefined
      }
      if (!document.hidden) {
        started = performance.now()
        timer = window.setTimeout(() => setShowLetter(true), Math.max(0, remaining))
      }
    }
    sync()
    document.addEventListener('visibilitychange', sync)
    return () => {
      window.clearTimeout(timer)
      document.removeEventListener('visibilitychange', sync)
    }
  }, [active, eligible, finished])

  return <>
    <div ref={viewport} className="credits__viewport" hidden={showLetter && eligible}>
      <div className={`credits__track${eligible ? ' credits__track--last' : ''}`}
        onAnimationEnd={event => {
          if (active && eligible && event.target === event.currentTarget && event.animationName === 'credits-roll') setFinished(true)
        }}>
        <p className="credits__kicker">{t('credits_heading')}</p>
        <h2 className="credits__name">{name}</h2>
        <p className="credits__role">{role}</p>

        <div className="credits__block">
          <p className="credits__label">{t('credits_built_with')}</p>
          <p className="credits__value">
            React · Vite · TypeScript{'\n'}Supabase · Monocraft
          </p>
        </div>

        <div className="credits__block">
          <p className="credits__label">{t('credits_music')}</p>
          <p className="credits__value">
            C418 — Minecraft{'\n'}C418 — Mice on Venus
          </p>
        </div>

        <div className="credits__block">
          <p className="credits__label">{t('credits_thanks')}</p>
          <p className="credits__value">{pick(credits)}</p>
        </div>

        <p ref={lastLine} className="credits__note">{t('credits_note')}</p>
      </div>
    </div>
    <div className="credits__afterword" aria-live="polite">
      {eligible && showLetter && <article className="credits__letter">
        <h2>{t('afterword_open')}</h2>
        <p>{t('afterword_games')}</p>
        <p>{t('afterword_thanks')}</p>
        <p>{t('afterword_goodbye')}</p>
        <p className="credits__signature">— {name}</p>
      </article>}
    </div>
  </>
}
