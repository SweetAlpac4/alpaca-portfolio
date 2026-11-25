import { createContext, useCallback, useContext, useMemo, useRef, useState, type ReactNode } from 'react'
import { brewCost, brewReward, loadNetherState, recordBrew, saveNetherState, RECIPE_BY_ID, type BrewRecipeId, type NetherState } from '../lib/nether'
import type { BrewResult } from '../lib/brewSession'
import { useFishing } from './FishingProvider'

type ActiveBrew = { id: string; recipe: BrewRecipeId }
type NetherContextValue = {
  state: NetherState
  spendResonance: () => void
  begin: (recipe: BrewRecipeId) => ActiveBrew | null
  finish: (id: string, result: BrewResult) => boolean
  cancel: (id: string) => void
  setSoulFlame: (enabled: boolean) => void
}
const NetherContext = createContext<NetherContextValue | null>(null)

export function NetherProvider({ children }: { children: ReactNode }) {
  const { reserveBrew, settleBrew } = useFishing()
  const [state, setState] = useState(loadNetherState)
  const current = useRef(state)
  const active = useRef<ActiveBrew | null>(null)
  const commit = useCallback((next: NetherState) => {
    current.current = next
    setState(next)
    saveNetherState(next)
  }, [])
  const spendResonance = useCallback(() => {
    const state = current.current
    if (state.resonance < 1) return
    commit({ ...state, resonance: state.resonance - 1 })
  }, [commit])
  const begin = useCallback((recipe: BrewRecipeId) => {
    if (active.current || !current.current.recipes.includes(recipe)) return null
    const id = `${Date.now()}-${Math.random().toString(36).slice(2)}`
    if (!reserveBrew(id, brewCost(RECIPE_BY_ID[recipe]))) return null
    active.current = { id, recipe }
    return active.current
  }, [reserveBrew])
  const finish = useCallback((id: string, result: BrewResult) => {
    const brew = active.current
    if (!brew || brew.id !== id) return false
    const recipe = RECIPE_BY_ID[brew.recipe]
    const refund = result.quality === 'ruined' ? brewCost(recipe)
      : result.quality === 'awkward' ? { [recipe.ingredients[0]]: 1 } : {}
    if (!settleBrew(id, refund, brewReward(recipe.id, result.quality))) return false
    active.current = null
    commit(recordBrew(current.current, recipe.id, result.score, result.clean))
    return true
  }, [commit, settleBrew])
  const cancel = useCallback((id: string) => {
    const brew = active.current
    if (!brew || brew.id !== id) return
    settleBrew(id, brewCost(RECIPE_BY_ID[brew.recipe]), { emberBait: 0, luck: 0 })
    active.current = null
  }, [settleBrew])
  const setSoulFlame = useCallback((enabled: boolean) => {
    if (enabled && current.current.perfects < 5) return
    commit({ ...current.current, soulFlame: enabled })
  }, [commit])
  const value = useMemo(() => ({ spendResonance, state, begin, finish, cancel, setSoulFlame }), [spendResonance, state, begin, finish, cancel, setSoulFlame])
  return <NetherContext.Provider value={value}>{children}</NetherContext.Provider>
}
export function useNether() {
  const context = useContext(NetherContext)
  if (!context) throw new Error('useNether must be used inside NetherProvider')
  return context
}
