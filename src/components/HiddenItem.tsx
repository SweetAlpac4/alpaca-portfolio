import { useState } from 'react'
import type { SectionId } from '../data/sections'
import { useLang } from '../i18n'
import { artifactForSection } from '../lib/achievements'
import { useAchievements } from './AchievementProvider'
import { PixelIcon } from './PixelIcon'

type Props = {
  section: SectionId
}

export function HiddenItem({ section }: Props) {
  const { t } = useLang()
  const { isUnlocked, unlock } = useAchievements()
  const [collecting, setCollecting] = useState(false)
  const artifact = artifactForSection(section)

  if (!artifact || (isUnlocked(artifact.id) && !collecting)) return null

  const collect = () => {
    if (collecting) return
    setCollecting(true)
    unlock(artifact.id)
    window.setTimeout(() => setCollecting(false), 520)
  }

  return (
    <button
      type="button"
      className={`artifact artifact--${section}${collecting ? ' artifact--collected' : ''}`}
      onClick={collect}
      aria-label={t('hidden_item')}
    >
      <PixelIcon name={artifact.icon} className="artifact__icon pixel" />
      <span className="artifact__tip">{t('hidden_item')}</span>
    </button>
  )
}
