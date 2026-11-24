import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from 'react'
import {
  ACHIEVEMENTS,
  ARTIFACTS,
  META_ACHIEVEMENT_ID,
  loadUnlocked,
  saveUnlocked,
  type AchievementDef,
  type AchievementId,
} from '../lib/achievements'

type AchievementContextValue = {
  unlocked: Set<AchievementId>
  isUnlocked: (id: AchievementId) => boolean
  unlock: (id: AchievementId) => void
  reset: () => void
  announcement: AchievementDef | null
}

const AchievementContext = createContext<AchievementContextValue | null>(null)

export function AchievementProvider({ children }: { children: ReactNode }) {
  const [unlocked, setUnlocked] = useState<Set<AchievementId>>(() => loadUnlocked())
  const [announcement, setAnnouncement] = useState<AchievementDef | null>(null)
  const unlockedRef = useRef(unlocked)
  const queueRef = useRef<AchievementDef[]>([])
  const announcementRef = useRef<AchievementDef | null>(null)

  useEffect(() => {
    unlockedRef.current = unlocked
  }, [unlocked])

  const showNext = useCallback(() => {
    const next = queueRef.current.shift() ?? null
    announcementRef.current = next
    setAnnouncement(next)
  }, [])

  const enqueue = useCallback(
    (achievement: AchievementDef) => {
      queueRef.current.push(achievement)
      if (!announcementRef.current) showNext()
    },
    [showNext],
  )

  useEffect(() => {
    if (!announcement) return
    const timer = window.setTimeout(showNext, 3400)
    return () => window.clearTimeout(timer)
  }, [announcement, showNext])

  const unlock = useCallback(
    (id: AchievementId) => {
      const current = unlockedRef.current
      if (current.has(id)) return

      const next = new Set(current)
      next.add(id)

      const achievement = ACHIEVEMENTS.find((item) => item.id === id)
      if (achievement) enqueue(achievement)

      if (
        ARTIFACTS.every((artifact) => next.has(artifact.id)) &&
        !next.has(META_ACHIEVEMENT_ID)
      ) {
        next.add(META_ACHIEVEMENT_ID)
        const meta = ACHIEVEMENTS.find((item) => item.id === META_ACHIEVEMENT_ID)
        if (meta) enqueue(meta)
      }

      unlockedRef.current = next
      setUnlocked(next)
      saveUnlocked(next)
    },
    [enqueue],
  )

  const reset = useCallback(() => {
    const empty = new Set<AchievementId>()
    unlockedRef.current = empty
    setUnlocked(empty)
    saveUnlocked(empty)
    queueRef.current = []
    announcementRef.current = null
    setAnnouncement(null)
  }, [])

  const isUnlocked = useCallback(
    (id: AchievementId) => unlocked.has(id),
    [unlocked],
  )

  const value = useMemo<AchievementContextValue>(
    () => ({ unlocked, isUnlocked, unlock, reset, announcement }),
    [announcement, isUnlocked, reset, unlock, unlocked],
  )

  return (
    <AchievementContext.Provider value={value}>
      {children}
    </AchievementContext.Provider>
  )
}

export function useAchievements() {
  const context = useContext(AchievementContext)
  if (!context) {
    throw new Error('useAchievements must be used inside AchievementProvider')
  }
  return context
}
