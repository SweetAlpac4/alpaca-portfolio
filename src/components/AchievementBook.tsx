import { useEffect, useRef, useState } from 'react'
import { useLang } from '../i18n'
import {
  ACHIEVEMENTS,
  ARTIFACTS,
  META_ACHIEVEMENT_ID,
} from '../lib/achievements'
import { useAchievements } from './AchievementProvider'
import { PixelIcon } from './PixelIcon'

type Props = {
  open: boolean
  onClose: () => void
}

export function AchievementBook({ open, onClose }: Props) {
  const { t, pick } = useLang()
  const { unlocked, reset } = useAchievements()
  const [confirmReset, setConfirmReset] = useState(false)
  const closeRef = useRef<HTMLButtonElement>(null)

  const artifactsFound = ARTIFACTS.filter((achievement) =>
    unlocked.has(achievement.id),
  ).length
  const allFound = artifactsFound === ARTIFACTS.length
  const percent = (artifactsFound / ARTIFACTS.length) * 100

  useEffect(() => {
    if (!open) {
      setConfirmReset(false)
      return
    }

    const previous = document.activeElement as HTMLElement | null
    closeRef.current?.focus()

    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        event.preventDefault()
        onClose()
      }
    }

    window.addEventListener('keydown', onKey)
    return () => {
      window.removeEventListener('keydown', onKey)
      previous?.focus()
    }
  }, [onClose, open])

  useEffect(() => {
    if (!confirmReset) return
    const timer = window.setTimeout(() => setConfirmReset(false), 3200)
    return () => window.clearTimeout(timer)
  }, [confirmReset])

  if (!open) return null

  const onReset = () => {
    if (!confirmReset) {
      setConfirmReset(true)
      return
    }
    reset()
    setConfirmReset(false)
  }

  return (
    <div
      className="book-overlay"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) onClose()
      }}
    >
      <div
        className="book"
        role="dialog"
        aria-modal="true"
        aria-labelledby="advancement-book-title"
      >
        <header className="book__head">
          <div>
            <p className="eyebrow">{t('lost_artifacts')}</p>
            <h2 id="advancement-book-title" className="book__title">
              {t('achievement_book')}
            </h2>
            <p className="book__sub">{t('achievement_book_sub')}</p>
          </div>
          <button
            ref={closeRef}
            type="button"
            className="book__close"
            onClick={onClose}
            aria-label={t('close')}
          >
            ×
          </button>
        </header>

        <div className="book__progress">
          <div className="book__progress-top">
            <span>{t('artifacts_found')}</span>
            <strong>
              {artifactsFound} / {ARTIFACTS.length}
            </strong>
          </div>
          <div
            className="book__bar"
            role="progressbar"
            aria-valuemin={0}
            aria-valuemax={ARTIFACTS.length}
            aria-valuenow={artifactsFound}
            aria-label={t('artifacts_found')}
          >
            <span style={{ width: `${percent}%` }} />
          </div>
        </div>

        <div className="book__body">
          {allFound && (
            <div className="book__complete">
              <PixelIcon name="trophy" className="book__complete-icon" />
              <div>
                <p className="book__complete-title">{t('all_artifacts')}</p>
                <p className="book__complete-sub">{t('all_artifacts_sub')}</p>
              </div>
            </div>
          )}

          <div className="advancement-grid">
            {ACHIEVEMENTS.map((achievement) => {
              const found = unlocked.has(achievement.id)
              const isMeta = achievement.id === META_ACHIEVEMENT_ID
              const title =
                found || !achievement.secret
                  ? pick(achievement.title)
                  : '???'
              return (
                <article
                  key={achievement.id}
                  className={`advancement-card${
                    found ? ' advancement-card--found' : ''
                  }${isMeta ? ' advancement-card--meta' : ''}`}
                >
                  <div className="advancement-card__icon">
                    <PixelIcon name={achievement.icon} className="pixel" />
                  </div>
                  <div className="advancement-card__body">
                    <div className="advancement-card__top">
                      <h3 className="advancement-card__title">{title}</h3>
                      <span
                        className={`advancement-card__state${
                          found ? ' advancement-card__state--found' : ''
                        }`}
                      >
                        {found ? t('found') : t('locked')}
                      </span>
                    </div>
                    {found ? (
                      <p className="advancement-card__desc">
                        {pick(achievement.description)}
                      </p>
                    ) : (
                      <p className="advancement-card__desc">
                        <span className="advancement-card__hint">
                          {t('hint')}
                        </span>{' '}
                        {pick(achievement.hint)}
                      </p>
                    )}
                  </div>
                </article>
              )
            })}
          </div>
        </div>

        <footer className="book__foot">
          <p>{t('progress_saved_locally')}</p>
          <button
            type="button"
            className={`mc-btn mc-btn--small ${
              confirmReset ? 'mc-btn--danger' : 'mc-btn--ghost'
            }`}
            onClick={onReset}
          >
            {confirmReset ? t('reset_confirm') : t('reset_progress')}
          </button>
        </footer>
      </div>
    </div>
  )
}
