import type { Experience } from '../data/types'
import { useLang } from '../i18n'
import { BiomeBackground } from '../components/BiomeBackground'

type Props = {
  experiences: Experience[]
}

export function Nether({ experiences }: Props) {
  const { t, pick } = useLang()
  const items = experiences.filter((item) => item.kind !== 'education')

  return (
    <section id="nether" className="biome biome--nether">
      <BiomeBackground name="nether" />
      <div className="biome__scrim" />

      <div className="biome__inner">
        <header className="section-head">
          <p className="eyebrow">04 — {t('nav_nether')}</p>
          <h2 className="section-title">
            {t('organizations')} &amp; {t('experience')}
          </h2>
          <p className="section-sub">{t('nether_sub')}</p>
        </header>

        {items.length === 0 ? (
          <p className="empty">{t('empty_experience')}</p>
        ) : (
          <div className="nether-grid timeline timeline--nether">
            {items.map((item) => (
              <article key={item.id} className="timeline__item">
                <p className="timeline__period">{item.period}</p>
                <h3 className="timeline__title">{pick(item.role)}</h3>
                <p className="timeline__org">{item.company}</p>
                <p className="timeline__desc">{pick(item.description)}</p>
              </article>
            ))}
          </div>
        )}
      </div>
    </section>
  )
}
