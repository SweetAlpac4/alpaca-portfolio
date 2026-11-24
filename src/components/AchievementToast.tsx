import type { AchievementDef } from '../lib/achievements'
import { useLang } from '../i18n'
import { PixelIcon } from './PixelIcon'

type Props = {
  achievement: AchievementDef | null
  offset: boolean
}

export function AchievementToast({ achievement, offset }: Props) {
  const { t, pick } = useLang()

  return (
    <div
      className={`toast toast--achievement${
        offset ? ' toast--offset' : ''
      }${achievement ? ' toast--show' : ''}`}
      aria-live="polite"
      aria-hidden={!achievement}
    >
      {achievement && (
        <>
          <PixelIcon name={achievement.icon} className="toast__icon" />
          <div>
            <p className="toast__label">{t('advancement')}</p>
            <p className="toast__title">{pick(achievement.title)}</p>
          </div>
        </>
      )}
    </div>
  )
}
