import { useCallback, useEffect, useRef, useState } from 'react'
import type { Achievement, Project } from '../data/types'
import { useLang } from '../i18n'
import { BiomeBackground } from '../components/BiomeBackground'

type Props = {
  projects: Project[]
  achievements: Achievement[]
}

type DeepDarkView = 'projects' | 'achievements'

const PER_PAGE = 3

export function DeepDark({ projects, achievements }: Props) {
  const { t, pick } = useLang()
  const [view, setView] = useState<DeepDarkView>('projects')
  const [page, setPage] = useState(0)
  const [projectOverflow, setProjectOverflow] = useState(false)
  const [projectEdges, setProjectEdges] = useState({
    atStart: true,
    atEnd: true,
  })
  const projectTrackRef = useRef<HTMLDivElement>(null)

  const updateProjectEdges = useCallback(() => {
    const el = projectTrackRef.current
    if (!el) return
    const max = el.scrollWidth - el.clientWidth
    const overflow = max > 4
    setProjectOverflow(overflow)
    setProjectEdges({
      atStart: el.scrollLeft <= 4,
      atEnd: !overflow || el.scrollLeft >= max - 4,
    })
  }, [])

  useEffect(() => {
    if (view !== 'projects') return
    updateProjectEdges()
    const el = projectTrackRef.current
    if (!el) return
    const observer = new ResizeObserver(() => updateProjectEdges())
    observer.observe(el)
    window.addEventListener('resize', updateProjectEdges)
    return () => {
      observer.disconnect()
      window.removeEventListener('resize', updateProjectEdges)
    }
  }, [updateProjectEdges, projects.length, view])

  const scrollProjects = (direction: -1 | 1) => {
    const el = projectTrackRef.current
    if (!el) return
    const card = el.querySelector<HTMLElement>('.project-card')
    const gap = Number.parseFloat(getComputedStyle(el).columnGap) || 16
    const step = card
      ? card.getBoundingClientRect().width + gap
      : el.clientWidth * 0.85
    el.scrollBy({ left: direction * step, behavior: 'smooth' })
  }

  const pageCount = Math.max(1, Math.ceil(achievements.length / PER_PAGE))
  const currentPage = Math.min(page, pageCount - 1)
  const visibleAchievements = achievements.slice(
    currentPage * PER_PAGE,
    currentPage * PER_PAGE + PER_PAGE,
  )

  return (
    <section id="deep-dark" className="biome biome--deep-dark">
      <BiomeBackground name="deep-dark" />
      <div className="biome__scrim" />

      <div className="biome__inner">
        <header className="section-head section-head--deep-dark">
          <p className="eyebrow">03 — {t('nav_deepdark')}</p>
          <h2 className="section-title">
            {t('projects')} &amp; {t('achievements')}
          </h2>
          <p className="section-sub">{t('deepdark_sub')}</p>

          <div className="section-head__row">
            <div
              className="section-tabs"
              role="tablist"
              aria-label={`${t('projects')} / ${t('achievements')}`}
            >
              <button
                type="button"
                role="tab"
                aria-selected={view === 'projects'}
                className={`section-tab${
                  view === 'projects' ? ' section-tab--active' : ''
                }`}
                onClick={() => setView('projects')}
              >
                {t('projects')}
                <span className="section-tab__count">
                  {projects.length}
                </span>
              </button>
              <button
                type="button"
                role="tab"
                aria-selected={view === 'achievements'}
                className={`section-tab${
                  view === 'achievements' ? ' section-tab--active' : ''
                }`}
                onClick={() => setView('achievements')}
              >
                {t('achievements')}
                <span className="section-tab__count">
                  {achievements.length}
                </span>
              </button>
            </div>

            {view === 'projects' && projectOverflow && (
              <div className="pager">
                <button
                  type="button"
                  className="mc-btn mc-btn--small"
                  onClick={() => scrollProjects(-1)}
                  disabled={projectEdges.atStart}
                  aria-label={t('previous_page')}
                >
                  ←
                </button>
                <span className="pager__label">{t('scroll_sideways')}</span>
                <button
                  type="button"
                  className="mc-btn mc-btn--small"
                  onClick={() => scrollProjects(1)}
                  disabled={projectEdges.atEnd}
                  aria-label={t('next_page')}
                >
                  →
                </button>
              </div>
            )}

            {view === 'achievements' && pageCount > 1 && (
              <div className="pager">
                <button
                  type="button"
                  className="mc-btn mc-btn--small"
                  onClick={() => setPage(currentPage - 1)}
                  disabled={currentPage === 0}
                  aria-label={t('previous_page')}
                >
                  ←
                </button>
                <span className="pager__label">
                  {currentPage + 1} / {pageCount}
                </span>
                <button
                  type="button"
                  className="mc-btn mc-btn--small"
                  onClick={() => setPage(currentPage + 1)}
                  disabled={currentPage >= pageCount - 1}
                  aria-label={t('next_page')}
                >
                  →
                </button>
              </div>
            )}
          </div>
        </header>

        {view === 'projects' ? (
          projects.length === 0 ? (
            <p className="empty">{t('empty_projects')}</p>
          ) : (
            <div
              className="project-row"
              ref={projectTrackRef}
              onScroll={updateProjectEdges}
            >
              {projects.map((project) => (
                <article className="project-card" key={project.id}>
                  <div className="project-card__frame">
                    {project.image_url ? (
                      <img
                        src={project.image_url}
                        alt={pick(project.title)}
                        loading="lazy"
                      />
                    ) : (
                      <div className="project-card__placeholder">
                        <span>{project.year ?? 'Chest'}</span>
                      </div>
                    )}
                  </div>

                  <div className="project-card__body">
                    <h3 className="project-card__title">
                      {pick(project.title)}
                    </h3>
                    <p className="project-card__desc">
                      {pick(project.description)}
                    </p>

                    <div className="project-card__tech">
                      {project.tech.slice(0, 5).map((tech) => (
                        <span className="chip" key={tech}>
                          {tech}
                        </span>
                      ))}
                    </div>

                    {(project.demo_url || project.repo_url) && (
                      <div className="project-card__links">
                        {project.demo_url && (
                          <a
                            href={project.demo_url}
                            target="_blank"
                            rel="noreferrer"
                          >
                            {t('live_demo')} →
                          </a>
                        )}
                        {project.repo_url && (
                          <a
                            href={project.repo_url}
                            target="_blank"
                            rel="noreferrer"
                          >
                            {t('source_code')} →
                          </a>
                        )}
                      </div>
                    )}
                  </div>
                </article>
              ))}
            </div>
          )
        ) : visibleAchievements.length === 0 ? (
          <p className="empty">{t('empty_achievements')}</p>
        ) : (
          <div className="achievement-grid">
            {visibleAchievements.map((achievement) => {
              const certificate = achievement.certificate_url
              const link = achievement.link_url || certificate
              const title = pick(achievement.title)

              return (
                <article className="achievement-card" key={achievement.id}>
                  {certificate ? (
                    <a
                      className="achievement-card__frame"
                      href={certificate}
                      target="_blank"
                      rel="noreferrer"
                      aria-label={`${t('view_certificate')}: ${title}`}
                    >
                      <img
                        src={certificate}
                        alt={`${t('certificate')} — ${title}`}
                        loading="lazy"
                      />
                    </a>
                  ) : (
                    <div className="achievement-card__frame">
                      <div className="achievement-card__placeholder">
                        <span
                          className="achievement-card__medal"
                          aria-hidden="true"
                        >
                          ★
                        </span>
                        <span>{t('certificate')}</span>
                      </div>
                    </div>
                  )}

                  <div className="achievement-card__body">
                    <div className="achievement-card__meta">
                      <span className="achievement-card__issuer">
                        {achievement.issuer}
                      </span>
                      {achievement.year && (
                        <span className="achievement-card__year">
                          {achievement.year}
                        </span>
                      )}
                    </div>

                    <h3 className="achievement-card__title">{title}</h3>
                    <p className="achievement-card__desc">
                      {pick(achievement.description)}
                    </p>

                    {link && (
                      <a
                        className="achievement-card__link"
                        href={link}
                        target="_blank"
                        rel="noreferrer"
                      >
                        {t('view_certificate')} →
                      </a>
                    )}
                  </div>
                </article>
              )
            })}
          </div>
        )}
      </div>
    </section>
  )
}
