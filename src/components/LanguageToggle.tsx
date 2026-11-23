import { useLang } from '../i18n'

export function LanguageToggle() {
  const { lang, setLang, t } = useLang()

  return (
    <div className="lang" role="group" aria-label={t('lang_label')}>
      <button
        type="button"
        className={`lang__btn${lang === 'en' ? ' lang__btn--active' : ''}`}
        onClick={() => setLang('en')}
        aria-pressed={lang === 'en'}
      >
        EN
      </button>
      <button
        type="button"
        className={`lang__btn${lang === 'id' ? ' lang__btn--active' : ''}`}
        onClick={() => setLang('id')}
        aria-pressed={lang === 'id'}
      >
        ID
      </button>
    </div>
  )
}
