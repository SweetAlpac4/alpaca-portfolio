import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from 'react'
import {
  MAX_CHEST_SIZE,
  RODS,
  ROD_BY_ID,
  checkRodUnlocks,
  createInitialFishingState,
  loadFishingState,
  saveFishingState,
  speciesCount,
  type FishCatch,
  type FishingState,
  type RodDef,
  type RodId,
} from '../lib/fishing'

type FishingContextValue = {
  state: FishingState
  selectedRod: RodDef
  unlockedRods: RodDef[]
  speciesFound: number
  chestFull: boolean
  recordCast: () => void
  recordCatch: (fish: FishCatch, perfect: boolean) => RodDef[]
  recordEscape: () => void
  selectRod: (id: RodId) => void
  releaseFish: (id: string) => void
  reset: () => void
}

const FishingContext = createContext<FishingContextValue | null>(null)

export function FishingProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<FishingState>(() => loadFishingState())
  const stateRef = useRef(state)

  const commit = useCallback((next: FishingState) => {
    stateRef.current = next
    setState(next)
    saveFishingState(next)
  }, [])

  const recordCast = useCallback(() => {
    const current = stateRef.current
    commit({
      ...current,
      stats: {
        ...current.stats,
        casts: current.stats.casts + 1,
      },
    })
  }, [commit])

  const recordCatch = useCallback(
    (fish: FishCatch, perfect: boolean) => {
      const current = stateRef.current
      if (current.chest.length >= MAX_CHEST_SIZE) return []

      const previous = current.discovered[fish.species]
      const record = {
        count: (previous?.count ?? 0) + 1,
        bestWeight: Math.max(previous?.bestWeight ?? 0, fish.weight),
        bestLength: Math.max(previous?.bestLength ?? 0, fish.length),
        bestSize:
          previous && previous.bestLength >= fish.length
            ? previous.bestSize
            : fish.size,
      }
      const currentStreak = perfect ? current.stats.currentStreak + 1 : 0

      let next: FishingState = {
        ...current,
        chest: [...current.chest, fish],
        discovered: {
          ...current.discovered,
          [fish.species]: record,
        },
        stats: {
          ...current.stats,
          catches: current.stats.catches + 1,
          totalWeight:
            Math.round((current.stats.totalWeight + fish.weight) * 10) / 10,
          currentStreak,
          bestStreak: Math.max(current.stats.bestStreak, currentStreak),
        },
      }

      const newRodIds = checkRodUnlocks(next)
      if (newRodIds.length > 0) {
        next = {
          ...next,
          rods: Array.from(new Set([...next.rods, ...newRodIds])),
        }
      }

      commit(next)
      return newRodIds
        .map((id) => RODS.find((rod) => rod.id === id))
        .filter((rod): rod is RodDef => Boolean(rod))
    },
    [commit],
  )

  const recordEscape = useCallback(() => {
    const current = stateRef.current
    commit({
      ...current,
      stats: {
        ...current.stats,
        escapes: current.stats.escapes + 1,
        currentStreak: 0,
      },
    })
  }, [commit])

  const selectRod = useCallback(
    (id: RodId) => {
      const current = stateRef.current
      if (!current.rods.includes(id)) return
      commit({ ...current, selectedRod: id })
    },
    [commit],
  )

  const releaseFish = useCallback(
    (id: string) => {
      const current = stateRef.current
      commit({
        ...current,
        chest: current.chest.filter((fish) => fish.id !== id),
      })
    },
    [commit],
  )

  const reset = useCallback(() => {
    commit(createInitialFishingState())
  }, [commit])

  const value = useMemo<FishingContextValue>(() => {
    const selectedRod = ROD_BY_ID[state.selectedRod] ?? RODS[0]
    return {
      state,
      selectedRod,
      unlockedRods: RODS.filter((rod) => state.rods.includes(rod.id)),
      speciesFound: speciesCount(state),
      chestFull: state.chest.length >= MAX_CHEST_SIZE,
      recordCast,
      recordCatch,
      recordEscape,
      selectRod,
      releaseFish,
      reset,
    }
  }, [
    recordCast,
    recordCatch,
    recordEscape,
    releaseFish,
    reset,
    selectRod,
    state,
  ])

  return (
    <FishingContext.Provider value={value}>{children}</FishingContext.Provider>
  )
}

export function useFishing() {
  const context = useContext(FishingContext)
  if (!context) {
    throw new Error('useFishing must be used inside FishingProvider')
  }
  return context
}
