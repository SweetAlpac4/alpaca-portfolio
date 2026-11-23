import { useLang } from '../i18n'

type Props = {
  show: boolean
  title: string
  texture: string
}

export function AdvancementToast({ show, title, texture }: Props) {
  const { t } = useLang()

  return (
    <div className={`toast${show ? ' toast--show' : ''}`} aria-live="polite">
      <img className="toast__icon pixel" src={texture} alt="" />
      <div>
        <p className="toast__label">{t('advancement')}</p>
        <p className="toast__title">{title}</p>
      </div>
    </div>
  )
}
