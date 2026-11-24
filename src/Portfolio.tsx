import { useCallback, useEffect, useRef, useState } from 'react'
import { fallbackContent } from './data/fallback'
import { useContent } from './data/api'
import { SECTIONS } from './data/sections'
import { useLang } from './i18n'
import { useMusic, MusicControls } from './components/MusicPlayer'
import { LoadingScreen } from './components/LoadingScreen'
import { LanguageToggle } from './components/LanguageToggle'
import { Hotbar } from './components/Hotbar'
import { AdvancementToast } from './components/AdvancementToast'
import { AchievementBook } from './components/AchievementBook'
import { AchievementToast } from './components/AchievementToast'
import { useAchievements } from './components/AchievementProvider'
import { FishingGame } from './components/FishingGame'
import { useFishing } from './components/FishingProvider'
import { ARTIFACTS } from './lib/achievements'
import { Overworld } from './sections/Overworld'
import { Cave } from './sections/Cave'
import { DeepDark } from './sections/DeepDark'
import { Nether } from './sections/Nether'
import { TheEnd } from './sections/TheEnd'
import { Credits } from './sections/Credits'

export function Portfolio() {
  const { t, pick, lang } = useLang()
  const { data, isLoading } = useContent()
  const { start, setTrack } = useMusic()
  const { unlocked, announcement } = useAchievements()
  const { selectedRod, state: fishingState } = useFishing()

  const content = data ?? fallbackContent
  const worldRef = useRef<HTMLDivElement>(null)
  const toastTimer = useRef<number | null>(null)
  const lastActive = useRef(0)

  const [entered, setEntered] = useState(false)
  const [active, setActive] = useState(0)
  const [progress, setProgress] = useState(0)
  const [toast, setToast] = useState(false)
  const [debug, setDebug] = useState(false)
  const [bookOpen, setBookOpen] = useState(false)
  const [fishingOpen, setFishingOpen] = useState(false)
  const [viewport, setViewport] = useState({ w: 0, h: 0 })

  const artifactsFound = ARTIFACTS.filter((achievement) =>
    unlocked.has(achievement.id),
  ).length
  const closeBook = useCallback(() => setBookOpen(false), [])
  const closeFishing = useCallback(() => setFishingOpen(false), [])

  const goTo = useCallback((index: number) => {
    const el = worldRef.current
    if (!el) return
    el.scrollTo({ top: index * el.clientHeight, behavior: 'smooth' })
  }, [])

  const onScroll = useCallback(() => {
    const el = worldRef.current
    if (!el) return
    const max = el.scrollHeight - el.clientHeight
    setProgress(max > 0 ? el.scrollTop / max : 0)
    const index = Math.max(
      0,
      Math.min(SECTIONS.length - 1, Math.round(el.scrollTop / el.clientHeight)),
    )
    setActive(index)
  }, [])

  const handleEnter = useCallback(() => {
    setEntered(true)
    worldRef.current?.scrollTo({ top: 0 })
  }, [])

  useEffect(() => {
    if (!entered) return
    if (active === lastActive.current) return
    lastActive.current = active
    setToast(true)
    if (toastTimer.current) window.clearTimeout(toastTimer.current)
    toastTimer.current = window.setTimeout(() => setToast(false), 2800)
  }, [active, entered])

  useEffect(() => {
    if (!entered) return
    setTrack(active >= 3 ? 'end' : 'overworld')
  }, [active, entered, setTrack])

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      const target = event.target as HTMLElement | null
      if (target && /^(INPUT|TEXTAREA|SELECT)$/.test(target.tagName)) return
      if (target?.isContentEditable) return
      if (event.key === 'F3') {
        event.preventDefault()
        setDebug((current) => !current)
        return
      }

      if (fishingOpen) {
        if (event.key === 'f' || event.key === 'F') {
          event.preventDefault()
          setFishingOpen(false)
        }
        return
      }

      if (bookOpen) {
        if (event.key === 'e' || event.key === 'E') {
          event.preventDefault()
          setBookOpen(false)
        }
        return
      }

      if (event.key === 'f' || event.key === 'F') {
        if (event.metaKey || event.ctrlKey || event.altKey) return
        event.preventDefault()
        setFishingOpen(true)
        return
      }

      if (event.key === 'e' || event.key === 'E') {
        if (event.metaKey || event.ctrlKey || event.altKey) return
        event.preventDefault()
        setBookOpen(true)
        return
      }

      const number = Number(event.key)
      if (number >= 1 && number <= SECTIONS.length) goTo(number - 1)
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [bookOpen, fishingOpen, goTo])

  useEffect(() => {
    const update = () => setViewport({ w: window.innerWidth, h: window.innerHeight })
    update()
    window.addEventListener('resize', update)
    return () => window.removeEventListener('resize', update)
  }, [])

  useEffect(() => {
    const title = pick(content.settings.seo_title) || 'Portfolio'
    document.title = title
    const description = document.querySelector('meta[name="description"]')
    if (description) {
      description.setAttribute('content', pick(content.settings.seo_description))
    }
  }, [content, pick, lang])

  useEffect(() => {
    const el = worldRef.current
    if (!el) return
    el.scrollTo({ top: 0 })
  }, [])

  const current = SECTIONS[active]

  return (
    <>
      {!entered && (
        <LoadingScreen
          ready={!isLoading}
          onPlay={() => void start()}
          onEnter={handleEnter}
        />
      )}

      <div className="world" ref={worldRef} onScroll={onScroll}>
        <Overworld profile={content.profile} onNavigate={goTo} />
        <Cave
          education={content.experiences.filter((item) => item.kind === 'education')}
          skills={content.skills}
        />
        <DeepDark
          projects={content.projects}
          achievements={content.achievements}
        />
        <Nether experiences={content.experiences} />
        <TheEnd profile={content.profile} socials={content.socials} />
        <Credits
          name={pick(content.profile.name)}
          role={pick(content.profile.role)}
          credits={content.settings.credits}
          active={active === SECTIONS.length - 1}
          onRespawn={() => goTo(0)}
        />
      </div>

      <LanguageToggle />
      <MusicControls />
      <Hotbar
        active={active}
        progress={progress}
        onSelect={goTo}
        onOpenBook={() => setBookOpen(true)}
        onOpenFishing={() => setFishingOpen(true)}
        artifactsFound={artifactsFound}
        artifactTotal={ARTIFACTS.length}
        selectedRod={selectedRod}
        fishCaught={fishingState.stats.catches}
      />
      <AdvancementToast
        show={toast}
        title={`${t('entering')} ${t(current.labelKey)}`}
        texture={current.texture}
      />
      <AchievementToast achievement={announcement} offset={toast} />
      <AchievementBook open={bookOpen} onClose={closeBook} />
      {fishingOpen && <FishingGame onClose={closeFishing} />}

      {debug && (
        <pre className="debug">
          {`Portfolio v1.0
Biome: ${t(current.labelKey)}
XYZ: 0.0 / ${(progress * 64).toFixed(1)} / 0.0
Section: ${active + 1}/${SECTIONS.length}
Artifacts: ${artifactsFound}/${ARTIFACTS.length}
Lang: ${lang.toUpperCase()}
Viewport: ${viewport.w} x ${viewport.h}
Fish: ${fishingState.stats.catches} caught / ${fishingState.chest.length} in chest
F3: debug screen on
E: advancement book
F: fishing`}
        </pre>
      )}
    </>
  )
}
