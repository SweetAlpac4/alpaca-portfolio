import { SECTIONS } from '../data/sections'
import { useLang } from '../i18n'

type Props = {
  active: number
  progress: number
  onSelect: (index: number) => void
}

export function Hotbar({ active, progress, onSelect }: Props) {
  const { t } = useLang()
  const percent = Math.round(Math.max(0, Math.min(1, progress)) * 100)

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
        </div>
      </nav>
    </>
  )
}
