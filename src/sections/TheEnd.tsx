import type { Profile, Social } from '../data/types'
import { useLang } from '../i18n'
import { BiomeBackground } from '../components/BiomeBackground'
import { SocialIcon } from '../components/SocialIcon'

type Props = {
  profile: Profile
  socials: Social[]
}

export function TheEnd({ profile, socials }: Props) {
  const { t } = useLang()
  const cvUrl = profile.resume_url?.trim() || '/cv.pdf'

  return (
    <section id="the-end" className="biome biome--end">
      <BiomeBackground name="the-end" />
      <div className="biome__scrim" />

      <div className="biome__inner">
        <div className="contact">
          <div>
            <p className="eyebrow">05 — {t('nav_end')}</p>
            <h2 className="contact__title">{t('lets_talk')}</h2>
            <p className="contact__blurb">{t('contact_blurb')}</p>

            <div className="contact__actions">
              <a className="mc-btn" href={`mailto:${profile.email}`}>
                {t('send_email')}
              </a>
              <a
                className="mc-btn mc-btn--ghost"
                href={cvUrl}
                target="_blank"
                rel="noreferrer"
              >
                {t('open_cv')}
              </a>
            </div>
          </div>

          <div>
            <p className="subhead">{t('find_me')}</p>
            <div className="social-list">
              {socials.map((social) => (
                <a
                  key={social.id}
                  className="social"
                  href={social.url}
                  target={social.url.startsWith('mailto:') ? undefined : '_blank'}
                  rel="noreferrer"
                >
                  <SocialIcon name={social.icon} />
                  <span className="social__platform">{social.platform}</span>
                  <span className="social__label">{social.label}</span>
                </a>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
