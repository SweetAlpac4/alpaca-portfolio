import { useState } from 'react'
import type { Lang, Localized } from '../../data/types'

type Props = {
  label: string
  value: Localized
  onChange: (value: Localized) => void
  multiline?: boolean
  rows?: number
  placeholder?: string
}

export function BilingualField({
  label,
  value,
  onChange,
  multiline = false,
  rows = 3,
  placeholder,
}: Props) {
  const [lang, setLang] = useState<Lang>('en')
  const current = value?.[lang] ?? ''
  const update = (text: string) => onChange({ ...value, [lang]: text })
  const fieldId = `bi-${label.toLowerCase().replace(/[^a-z0-9]+/g, '-')}-${lang}`

  return (
    <div className="bilingual">
      <div className="bilingual__tabs">
        <button
          type="button"
          className={`bilingual__tab${lang === 'en' ? ' bilingual__tab--active' : ''}`}
          onClick={() => setLang('en')}
        >
          EN
        </button>
        <button
          type="button"
          className={`bilingual__tab${lang === 'id' ? ' bilingual__tab--active' : ''}`}
          onClick={() => setLang('id')}
        >
          ID
        </button>
        <span className="bilingual__hint">
          {lang === 'en' ? 'English' : 'Bahasa Indonesia'}
        </span>
      </div>

      <div className="field" style={{ marginTop: 0 }}>
        <label htmlFor={fieldId}>{label}</label>
        {multiline ? (
          <textarea
            id={fieldId}
            className="textarea"
            rows={rows}
            value={current}
            placeholder={placeholder}
            onChange={(event) => update(event.target.value)}
          />
        ) : (
          <input
            id={fieldId}
            className="input"
            value={current}
            placeholder={placeholder}
            onChange={(event) => update(event.target.value)}
          />
        )}
      </div>
    </div>
  )
}
