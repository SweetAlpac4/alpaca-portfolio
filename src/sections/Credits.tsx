import type { Localized } from '../data/types'
import { useLang } from '../i18n'
import { HiddenItem } from '../components/HiddenItem'
import { useAchievements } from '../components/AchievementProvider'
import { META_ACHIEVEMENT_ID } from '../lib/achievements'

type Props = {
  name: string
  role: string
  credits: Localized
  active: boolean
  onRespawn: () => void
}

export function Credits({ name, role, credits, active, onRespawn }: Props) {
  const { t, pick } = useLang()
  const { isUnlocked } = useAchievements()

  return (
    <section
      id="credits"
      className={`biome biome--credits${active ? ' is-active' : ''}`}
    >
      <div className="stars" aria-hidden="true" />
      <HiddenItem section="credits" />

      <div className="credits__viewport">
        <div className="credits__track" key={active ? 'credits-run' : 'credits-idle'}>
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

          {isUnlocked(META_ACHIEVEMENT_ID) && (
            <div className="credits__block credits__block--secret">
              <p className="credits__label">{t('secret_ending_label')}</p>
              <p className="credits__value">{t('secret_ending')}</p>
            </div>
          )}

          <p className="credits__note">{t('credits_note')}</p>
        </div>
      </div>

      <div className="credits__actions">
        <button className="mc-btn" onClick={onRespawn}>
          {t('back_to_top')}
        </button>
      </div>
    </section>
  )
}
