import { SECTIONS } from '../data/sections'
import { useLang } from '../i18n'
import { PixelIcon } from './PixelIcon'

type Props = {
  active: number
  progress: number
  onSelect: (index: number) => void
  onOpenBook: () => void
  artifactsFound: number
  artifactTotal: number
}

export function Hotbar({
  active,
  progress,
  onSelect,
  onOpenBook,
  artifactsFound,
  artifactTotal,
}: Props) {
  const { t } = useLang()
  const percent = Math.round(Math.max(0, Math.min(1, progress)) * 100)
  const complete = artifactsFound === artifactTotal

  return (
    <>
      <div className="xp" aria-hidden="true">
        <div className="xp__fill" style={{ width: `${percent}%` }} />
      </div>
      <span className="xp__level" aria-hidden="true">
        {active + 1}
      </span>

      <nav className="hotbar" aria-label={t('menu')}>
        <div className="hotbar__frame">
          {SECTIONS.map((section, index) => (
            <button
              key={section.id}
              type="button"
              className={`hotbar__slot${index === active ? ' hotbar__slot--active' : ''}`}
              onClick={() => onSelect(index)}
              aria-label={t(section.labelKey)}
              aria-current={index === active ? 'true' : undefined}
            >
              <img src={section.texture} alt="" className="pixel" />
              <span className="hotbar__tip">{t(section.labelKey)}</span>
              <span className="hotbar__key">{index + 1}</span>
            </button>
          ))}

          <button
            type="button"
            className={`hotbar__slot hotbar__slot--book${
              complete ? ' hotbar__slot--complete' : ''
            }`}
            onClick={onOpenBook}
            aria-label={`${t('achievement_book')} (${artifactsFound}/${artifactTotal})`}
            aria-keyshortcuts="E"
          >
            <PixelIcon name="book" className="hotbar__book-icon" />
            <span className="hotbar__tip">
              {t('achievement_book')} <span className="hotbar__tip-key">E</span>
            </span>
            <span className="hotbar__count">
              {artifactsFound}/{artifactTotal}
            </span>
          </button>
        </div>
      </nav>
    </>
  )
}
