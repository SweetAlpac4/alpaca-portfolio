import type { MaterialId } from './materials'

export type OreId = 'coal' | 'iron' | 'gold' | 'redstone' | 'lapis' | 'diamond'
export type PickaxeTier = 'wood' | 'stone' | 'iron' | 'diamond'
export type CaveBlockContent = OreId | 'stone' | 'gravel' | 'lava' | 'nether_quartz' | 'glowstone_dust'
export type CaveBlock = { id: string; row: number; col: number; content: CaveBlockContent; mined: boolean }
export type CaveState = {
  version: 1
  ores: Record<OreId, number>
  pickaxe: PickaxeTier
  runs: number
  bestScore: number
  totalBlocks: number
  totalOres: number
  foundOres: OreId[]
  quartzMined: number
  glowstoneMined: number
  lavaHits: number
  cleanRuns: number
  bestCombo: number
}
export type RunSummary = { score: number; bestCombo: number; lavaHits: number; blocks: number }
export type MineResolution = {
  content: CaveBlockContent
  durabilityCost: number
  score: number
  combo: number
  material: MaterialId | null
  materialAmount: number
  ore: OreId | null
  ended: boolean
}

export const CAVE_STORAGE_KEY = 'portfolio-cave-v1'
const ORE_IDS: OreId[] = ['coal', 'iron', 'gold', 'redstone', 'lapis', 'diamond']
const ZERO_ORES: Record<OreId, number> = { coal: 0, iron: 0, gold: 0, redstone: 0, lapis: 0, diamond: 0 }
const TIER_ORDER: PickaxeTier[] = ['wood', 'stone', 'iron', 'diamond']
export const PICKAXES: Record<PickaxeTier, { tier: PickaxeTier; durability: number; maxRow: number; label: string; cost: Partial<Record<OreId, number>> }> = {
  wood: { tier: 'wood', durability: 22, maxRow: 3, label: 'cave_tier_wood', cost: {} },
  stone: { tier: 'stone', durability: 27, maxRow: 4, label: 'cave_tier_stone', cost: { coal: 8 } },
  iron: { tier: 'iron', durability: 32, maxRow: 6, label: 'cave_tier_iron', cost: { iron: 8, coal: 16 } },
  diamond: { tier: 'diamond', durability: 38, maxRow: 7, label: 'cave_tier_diamond', cost: { diamond: 2, iron: 10, coal: 16 } },
}
export const ORE_VALUES: Record<OreId | 'nether_quartz' | 'glowstone_dust', number> = {
  coal: 2, iron: 4, gold: 6, redstone: 5, lapis: 8, diamond: 25, nether_quartz: 10, glowstone_dust: 12,
}
export const DEPTH_MULTIPLIER: Record<number, number> = { 1: 1, 2: 1, 3: 1.5, 4: 1.5, 5: 2, 6: 2, 7: 3 }
export const BLOCK_WEIGHTS: Record<number, Partial<Record<CaveBlockContent, number>>> = {
  1: { stone: 56, coal: 18, iron: 9, gold: 3, redstone: 3, lapis: 1.5, diamond: 0.5, gravel: 6, lava: 3 },
  2: { stone: 56, coal: 18, iron: 9, gold: 3, redstone: 3, lapis: 1.5, diamond: 0.5, gravel: 6, lava: 3 },
  3: { stone: 56, coal: 18, iron: 9, gold: 3, redstone: 3, lapis: 1.5, diamond: 0.5, gravel: 6, lava: 3 },
  4: { stone: 44, coal: 10, iron: 14, gold: 6, redstone: 6, lapis: 4, diamond: 1.5, nether_quartz: 5, gravel: 6, lava: 3.5 },
  5: { stone: 44, coal: 10, iron: 14, gold: 6, redstone: 6, lapis: 4, diamond: 1.5, nether_quartz: 5, gravel: 6, lava: 3.5 },
  6: { stone: 35, coal: 5, iron: 10, gold: 8, redstone: 7, lapis: 6, diamond: 3, nether_quartz: 6, glowstone_dust: 3, gravel: 8, lava: 9 },
  7: { stone: 28, coal: 4, iron: 9, gold: 9, redstone: 8, lapis: 7, diamond: 5, nether_quartz: 6, glowstone_dust: 8, gravel: 7, lava: 9 },
}

export function createInitialCaveState(): CaveState {
  return { version: 1, ores: { ...ZERO_ORES }, pickaxe: 'wood', runs: 0, bestScore: 0, totalBlocks: 0, totalOres: 0, foundOres: [], quartzMined: 0, glowstoneMined: 0, lavaHits: 0, cleanRuns: 0, bestCombo: 0 }
}
const isOre = (value: unknown): value is OreId => typeof value === 'string' && ORE_IDS.includes(value as OreId)
const isTier = (value: unknown): value is PickaxeTier => typeof value === 'string' && TIER_ORDER.includes(value as PickaxeTier)
const safeNumber = (value: unknown) => typeof value === 'number' && Number.isFinite(value) ? Math.max(0, Math.floor(value)) : 0

export function loadCaveState(): CaveState {
  const initial = createInitialCaveState()
  if (typeof window === 'undefined') return initial
  try {
    const storage = window.localStorage
    if (!storage) return initial
    const raw = storage.getItem(CAVE_STORAGE_KEY)
    if (!raw) return initial
    const parsed = JSON.parse(raw) as Partial<CaveState>
    const ores = { ...ZERO_ORES }
    if (parsed.ores && typeof parsed.ores === 'object') for (const id of ORE_IDS) ores[id] = safeNumber(parsed.ores[id])
    return {
      version: 1, ores, pickaxe: isTier(parsed.pickaxe) ? parsed.pickaxe : 'wood',
      runs: safeNumber(parsed.runs), bestScore: safeNumber(parsed.bestScore), totalBlocks: safeNumber(parsed.totalBlocks), totalOres: safeNumber(parsed.totalOres),
      foundOres: Array.isArray(parsed.foundOres) ? Array.from(new Set(parsed.foundOres.filter(isOre))) : [],
      quartzMined: safeNumber(parsed.quartzMined), glowstoneMined: safeNumber(parsed.glowstoneMined), lavaHits: safeNumber(parsed.lavaHits), cleanRuns: safeNumber(parsed.cleanRuns), bestCombo: safeNumber(parsed.bestCombo),
    }
  } catch { return initial }
}
export function saveCaveState(state: CaveState) {
  if (typeof window === 'undefined') return
  try { window.localStorage?.setItem(CAVE_STORAGE_KEY, JSON.stringify(state)) } catch { /* Storage can be unavailable or full. */ }
}

function rollBlock(row: number, rng: () => number): CaveBlockContent {
  const weights = BLOCK_WEIGHTS[row]
  const entries = Object.entries(weights) as [CaveBlockContent, number][]
  let ticket = Math.max(0, Math.min(0.999999999, rng())) * entries.reduce((sum, [, weight]) => sum + weight, 0)
  for (const [content, weight] of entries) { ticket -= weight; if (ticket < 0) return content }
  return 'stone'
}
export function generateGrid(pickaxe: PickaxeTier, rng: () => number = Math.random): CaveBlock[] {
  const grid = Array.from({ length: 49 }, (_, i) => {
    const row = Math.floor(i / 7) + 1
    let content = rollBlock(row, rng)
    if (row === 1 && content === 'lava') {
      let rerolls = 0
      while (content === 'lava' && rerolls < 20) { content = rollBlock(row, rng); rerolls++ }
      if (content === 'lava') content = 'stone'
    }
    return { id: `${row}-${i % 7 + 1}`, row, col: i % 7 + 1, content, mined: false }
  })
  const shallowCoal = grid.filter((block) => block.row <= 3 && block.content === 'coal')
  for (let i = shallowCoal.length; i < 2; i++) {
    const index = grid.findIndex(block => block.row <= 3 && block.content !== 'coal' && block.content !== 'lava')
    if (index >= 0) grid[index] = { ...grid[index], content: 'coal' }
  }
  // Keep all generated depths in the grid; accessibility is controlled by the equipped pickaxe.
  void PICKAXES[pickaxe]
  return grid
}
export function isReachable(block: CaveBlock, grid: CaveBlock[], maxRow: number): boolean {
  if (block.mined || block.row > maxRow) return false
  if (!grid.some(item => item.mined)) return block.row === 1
  return grid.some(item => item.mined && Math.abs(item.row - block.row) + Math.abs(item.col - block.col) === 1)
}
export function resolveMine(block: CaveBlock, durability: number, combo: number, rng: () => number = Math.random): MineResolution {
  const content = block.content
  const ore = isOre(content) ? content : null
  const material: MaterialId | null = content === 'nether_quartz' ? 'nether_quartz' : content === 'glowstone_dust' ? 'glowstone_dust' : null
  const nextCombo = ore || material ? combo + 1 : 0
  const value = ore || material ? ORE_VALUES[content as keyof typeof ORE_VALUES] : 0
  const score = value ? Math.round(value * DEPTH_MULTIPLIER[block.row] * (1 + Math.min(nextCombo, 5) * 0.1)) : 0
  return { content, durabilityCost: content === 'lava' ? 4 : content === 'gravel' ? 2 : 1, score, combo: nextCombo, material, materialAmount: material ? (rng() < 0.1 ? 2 : 1) : 0, ore, ended: durability - (content === 'lava' ? 4 : content === 'gravel' ? 2 : 1) <= 0 }
}
export function nextPickaxe(tier: PickaxeTier): PickaxeTier | null { const index = TIER_ORDER.indexOf(tier); return TIER_ORDER[index + 1] ?? null }
export function canUpgrade(state: CaveState): boolean { const next = nextPickaxe(state.pickaxe); return Boolean(next && Object.entries(PICKAXES[next].cost).every(([id, amount]) => state.ores[id as OreId] >= (amount ?? 0))) }
export function upgradePickaxe(state: CaveState): CaveState | null {
  const next = nextPickaxe(state.pickaxe)
  if (!next || !canUpgrade(state)) return null
  const ores = { ...state.ores }
  for (const [id, amount] of Object.entries(PICKAXES[next].cost)) ores[id as OreId] -= amount ?? 0
  return { ...state, pickaxe: next, ores }
}
export function applyRunSummary(state: CaveState, summary: RunSummary): CaveState {
  return { ...state, runs: state.runs + 1, bestScore: Math.max(state.bestScore, safeNumber(summary.score)), bestCombo: Math.max(state.bestCombo, safeNumber(summary.bestCombo)), lavaHits: state.lavaHits + safeNumber(summary.lavaHits), cleanRuns: state.cleanRuns + (summary.lavaHits === 0 ? 1 : 0), totalBlocks: state.totalBlocks + safeNumber(summary.blocks) }
}
export function addOreToState(state: CaveState, ore: OreId, amount = 1): CaveState {
  const count = Math.max(1, safeNumber(amount))
  return { ...state, ores: { ...state.ores, [ore]: state.ores[ore] + count }, totalOres: state.totalOres + count, foundOres: state.foundOres.includes(ore) ? state.foundOres : [...state.foundOres, ore] }
}
export function addMaterialToState(state: CaveState, material: MaterialId, amount = 1): CaveState {
  const count = Math.max(1, safeNumber(amount))
  if (material === 'nether_quartz') return { ...state, quartzMined: state.quartzMined + count }
  if (material === 'glowstone_dust') return { ...state, glowstoneMined: state.glowstoneMined + count }
  return state
}
