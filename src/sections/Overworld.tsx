import type { Profile } from '../data/types'
import { useLang } from '../i18n'
import { BiomeBackground } from '../components/BiomeBackground'
import { HiddenItem } from '../components/HiddenItem'

type Props = {
  profile: Profile
  onNavigate: (index: number) => void
}

export function Overworld({ profile, onNavigate }: Props) {
  const { t, pick } = useLang()
  const cvUrl = profile.resume_url?.trim() || '/cv.pdf'

  return (
    <section id="overworld" className="biome biome--overworld">
      <BiomeBackground name="overworld" eager />
      <div className="biome__scrim" />
      <HiddenItem section="overworld" />

      <div className="biome__inner">
        <div className="hero">
          <div>
            <p className="eyebrow">01 — {t('nav_overworld')}</p>
            <h1 className="hero__name">{pick(profile.name)}</h1>
            <p className="hero__role">{pick(profile.role)}</p>
            <p className="hero__tagline">{pick(profile.tagline)}</p>

            <div className="hero__actions">
              <button className="mc-btn" onClick={() => onNavigate(2)}>
                {t('view_projects')}
              </button>
              <button
                className="mc-btn mc-btn--ghost"
                onClick={() => onNavigate(4)}
              >
                {t('contact_me')}
              </button>
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

          <aside className="player-card panel" aria-label={t('about_me')}>
            <div className="player-card__head">
              <div className="avatar">
                {profile.avatar_url ? (
                  <img src={profile.avatar_url} alt={pick(profile.name)} />
                ) : (
                  <span className="avatar__fallback" aria-hidden="true">
                    ?
                  </span>
                )}
              </div>
              <div>
                <p className="player-card__name">{pick(profile.name)}</p>
                <p className="player-card__meta">{pick(profile.location)}</p>
              </div>
            </div>

            <ul className="player-card__stats">
              <li>
                <span>Biome</span>
                <span>{t('nav_overworld')}</span>
              </li>
              <li>
                <span>Email</span>
                <span>{profile.email}</span>
              </li>
            </ul>

            <p className="player-card__bio">{pick(profile.bio)}</p>
          </aside>
        </div>
      </div>

      <div className="scroll-hint">{t('scroll_hint')}</div>
    </section>
  )
}
