import { createContext, useCallback, useContext, useMemo, useRef, useState, type ReactNode } from 'react'
import { addMaterialToState, addOreToState, applyRunSummary, loadCaveState, saveCaveState, upgradePickaxe, type OreId, type RunSummary, type CaveState } from '../lib/cave'
import type { MaterialId } from '../lib/materials'
import { useFishing } from './FishingProvider'

type CaveContextValue = {
  state: CaveState
  spendVoidsteel: () => void
  addOre: (ore: OreId, amount?: number) => void
  addMaterial: (material: MaterialId, amount: number) => void
  finishRun: (summary: RunSummary) => void
  upgrade: () => boolean
}
const CaveContext = createContext<CaveContextValue | null>(null)

export function CaveProvider({ children }: { children: ReactNode }) {
  const { addMaterials } = useFishing()
  const [state, setState] = useState(loadCaveState)
  const current = useRef(state)
  const commit = useCallback((next: CaveState) => {
    current.current = next
    setState(next)
    saveCaveState(next)
  }, [])
  const addOre = useCallback((ore: OreId, amount = 1) => commit(addOreToState(current.current, ore, amount)), [commit])
  const addMaterial = useCallback((material: MaterialId, amount: number) => {
    addMaterials({ [material]: amount })
    commit(addMaterialToState(current.current, material, amount))
  }, [addMaterials, commit])
  const finishRun = useCallback((summary: RunSummary) => commit(applyRunSummary(current.current, summary)), [commit])
  const spendVoidsteel = useCallback(() => {
    const state = current.current
    if (state.ores.voidsteel < 1) return
    commit({ ...state, ores: { ...state.ores, voidsteel: state.ores.voidsteel - 1 } })
  }, [commit])
  const upgrade = useCallback(() => {
    const next = upgradePickaxe(current.current)
    if (!next) return false
    commit(next)
    return true
  }, [commit])
  const value = useMemo(() => ({ spendVoidsteel, state, addOre, addMaterial, finishRun, upgrade }), [spendVoidsteel, state, addOre, addMaterial, finishRun, upgrade])
  return <CaveContext.Provider value={value}>{children}</CaveContext.Provider>
}
export function useCave() {
  const context = useContext(CaveContext)
  if (!context) throw new Error('useCave must be used inside CaveProvider')
  return context
}
