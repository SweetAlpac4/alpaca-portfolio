import { BiomeIcon } from './BiomeIcon'
import type { SectionId } from '../data/sections'
import { useLang } from '../i18n'

type Props = {
  show: boolean
  title: string
  biome: SectionId
}

export function AdvancementToast({ show, title, biome }: Props) {
  const { t } = useLang()

  return (
    <div className={`toast${show ? ' toast--show' : ''}`} aria-live="polite">
      <BiomeIcon name={biome} className="toast__icon" />
      <div>
        <p className="toast__label">{t('advancement')}</p>
        <p className="toast__title">{title}</p>
      </div>
    </div>
  )
}
