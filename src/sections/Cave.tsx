import type { Experience, Skill } from '../data/types'
import { useLang } from '../i18n'
import { BiomeBackground } from '../components/BiomeBackground'

type Props = {
  education: Experience[]
  skills: Skill[]
}

export function Cave({ education, skills }: Props) {
  const { t, pick } = useLang()

  const groups = new Map<string, { label: string; items: Skill[] }>()
  for (const skill of skills) {
    const key = skill.category.en || skill.category.id || 'other'
    const label = pick(skill.category) || key
    const group = groups.get(key)
    if (group) group.items.push(skill)
    else groups.set(key, { label, items: [skill] })
  }

  return (
    <section id="cave" className="biome biome--cave">
      <BiomeBackground name="cave" />
      <div className="biome__scrim" />

      <div className="biome__inner">
        <header className="section-head">
          <p className="eyebrow">02 — {t('nav_cave')}</p>
          <h2 className="section-title">{t('education')} &amp; {t('skills')}</h2>
          <p className="section-sub">{t('cave_sub')}</p>
        </header>

        <div className="cave-grid">
          <div>
            <p className="subhead">{t('education')}</p>
            {education.length === 0 ? (
              <p className="empty">{t('empty_experience')}</p>
            ) : (
              <div className="timeline">
                {education.map((item) => (
                  <article
                    key={item.id}
                    className="timeline__item"
                    style={{ ['--accent' as string]: '#c9a227' }}
                  >
                    <p className="timeline__period">{item.period}</p>
                    <h3 className="timeline__title">{pick(item.role)}</h3>
                    <p className="timeline__org">{item.company}</p>
                    <p className="timeline__desc">{pick(item.description)}</p>
                  </article>
                ))}
              </div>
            )}
          </div>

          <div>
            <p className="subhead">{t('skills')}</p>
            {skills.length === 0 ? (
              <p className="empty">{t('empty_skills')}</p>
            ) : (
              Array.from(groups.values()).map((group) => (
                <div className="skill-group" key={group.label}>
                  <p className="skill-group__name">{group.label}</p>
                  <div className="skill-list">
                    {group.items.map((skill) => (
                      <span
                        key={skill.id}
                        className={`skill skill--${skill.tier}`}
                        title={t(`tier_${skill.tier}`)}
                      >
                        <span className="skill__gem" aria-hidden="true" />
                        {skill.name}
                      </span>
                    ))}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </section>
  )
}
