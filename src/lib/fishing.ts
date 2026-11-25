import type { Localized } from '../data/types'
import type { TranslationKey } from '../i18n'
import {
  MATERIAL_CATCH_CHANCE,
  isMaterialId,
  rollMaterial,
  type MaterialId,
} from './materials.ts'

export type RodId = 'basic' | 'sturdy' | 'lucky' | 'golden' | 'prismarine'
export type FishId =
  | 'old_boot'
  | 'kelp'
  | 'cod'
  | 'salmon'
  | 'tropical_fish'
  | 'pufferfish'
  | 'nautilus_shell'
  | 'enchanted_book'
  | 'name_tag'
  | 'prismarine_shard'
  | 'heart_of_the_sea'
  | 'ancient_scale'
  | 'echo_fish'

export type Rarity = 'common' | 'uncommon' | 'rare' | 'legendary' | 'mythic'
export type FishSize = 'tiny' | 'small' | 'average' | 'large' | 'trophy'

export type RodRequirement = {
  metric: 'catches' | 'species'
  count: number
}

export type RodDef = {
  id: RodId
  name: Localized
  description: Localized
  unlockText: Localized
  color: string
  tier: number
  biteWindow: number
  tensionRate: number
  reelSpeed: number
  luck: number
  requirement?: RodRequirement
}

export type FishDef = {
  id: FishId
  name: Localized
  description: Localized
  rarity: Rarity
  minWeight: number
  maxWeight: number
  minLength: number
  maxLength: number
  secret?: boolean
  requires?: 'echo_shard'
}

export type CatchRoll = {
  species: FishId
  rarity: Rarity
  weight: number
  length: number
  size: FishSize
}

export type FishingRoll =
  | { kind: 'fish'; roll: CatchRoll }
  | { kind: 'material'; material: MaterialId; amount: number }

export type FishCatch = CatchRoll & {
  id: string
  rod: RodId
  caughtAt: number
}

export type FishRecord = {
  count: number
  bestWeight: number
  bestLength: number
  bestSize: FishSize
}

export type FishingStats = {
  casts: number
  catches: number
  escapes: number
  currentStreak: number
  bestStreak: number
  totalWeight: number
}

export type FishingEffects = { emberBait: number; luck: number }
export type MaterialBag = Partial<Record<MaterialId, number>>

export type FishingState = {
  version: 1
  rods: RodId[]
  selectedRod: RodId
  chest: FishCatch[]
  discovered: Partial<Record<FishId, FishRecord>>
  materials: MaterialBag
  materialsFound: MaterialId[]
  materialCatches: number
  starterClaimed: boolean
  effects: FishingEffects
  pendingBrew: { id: string; cost: MaterialBag } | null
  stats: FishingStats
}

export const FISHING_STORAGE_KEY = 'portfolio-fishing-v1'
export const MAX_CHEST_SIZE = 54

export const RODS: RodDef[] = [
  {
    id: 'basic',
    tier: 1,
    color: '#a5703b',
    name: { en: 'Basic Rod', id: 'Pancing Basic' },
    description: {
      en: 'A simple rod. Good enough to start.',
      id: 'Pancing sederhana. Cukup untuk memulai.',
    },
    unlockText: { en: 'Starter rod', id: 'Pancing awal' },
    biteWindow: 950,
    tensionRate: 46,
    reelSpeed: 24,
    luck: 0,
  },
  {
    id: 'sturdy',
    tier: 2,
    color: '#b5b5bd',
    name: { en: 'Sturdy Rod', id: 'Pancing Kokoh' },
    description: {
      en: 'A wider safety margin while reeling.',
      id: 'Zona aman lebih lebar saat menarik.',
    },
    unlockText: { en: 'Catch 5 fish', id: 'Tangkap 5 ikan' },
    biteWindow: 1000,
    tensionRate: 38,
    reelSpeed: 26,
    luck: 0.1,
    requirement: { metric: 'catches', count: 5 },
  },
  {
    id: 'lucky',
    tier: 3,
    color: '#7ec850',
    name: { en: 'Lucky Rod', id: 'Pancing Keberuntungan' },
    description: {
      en: 'Better odds for rare catches.',
      id: 'Peluang lebih besar untuk tangkapan langka.',
    },
    unlockText: { en: 'Discover 5 species', id: 'Temukan 5 spesies' },
    biteWindow: 950,
    tensionRate: 50,
    reelSpeed: 24,
    luck: 0.55,
    requirement: { metric: 'species', count: 5 },
  },
  {
    id: 'golden',
    tier: 4,
    color: '#ffd75e',
    name: { en: 'Golden Rod', id: 'Pancing Emas' },
    description: {
      en: 'A longer bite window for calm hands.',
      id: 'Window gigitan lebih lama untuk tangan yang tenang.',
    },
    unlockText: { en: 'Catch 20 fish', id: 'Tangkap 20 ikan' },
    biteWindow: 1200,
    tensionRate: 44,
    reelSpeed: 28,
    luck: 0.35,
    requirement: { metric: 'catches', count: 20 },
  },
  {
    id: 'prismarine',
    tier: 5,
    color: '#4fd6c9',
    name: { en: 'Prismarine Rod', id: 'Pancing Prismarine' },
    description: {
      en: 'The endgame rod: stable, lucky, and fast.',
      id: 'Pancing endgame: stabil, beruntung, dan cepat.',
    },
    unlockText: { en: 'Discover 10 species', id: 'Temukan 10 spesies' },
    biteWindow: 1150,
    tensionRate: 34,
    reelSpeed: 30,
    luck: 0.8,
    requirement: { metric: 'species', count: 10 },
  },
]

export const FISH: FishDef[] = [
  {
    id: 'old_boot',
    rarity: 'common',
    name: { en: 'Old Boot', id: 'Sepatu Bot Lama' },
    description: {
      en: 'A very soggy boot. At least it counts.',
      id: 'Sepatu bot yang sangat basah. Setidaknya terhitung.',
    },
    minWeight: 0.8,
    maxWeight: 2.5,
    minLength: 20,
    maxLength: 35,
  },
  {
    id: 'kelp',
    rarity: 'common',
    name: { en: 'Kelp', id: 'Kelp' },
    description: {
      en: 'Green, slimy, and oddly calming.',
      id: 'Hijau, berlendir, dan entah kenapa menenangkan.',
    },
    minWeight: 0.2,
    maxWeight: 1.2,
    minLength: 30,
    maxLength: 120,
  },
  {
    id: 'cod',
    rarity: 'common',
    name: { en: 'Cod', id: 'Ikan Cod' },
    description: {
      en: 'A dependable classic.',
      id: 'Klasik yang bisa diandalkan.',
    },
    minWeight: 0.5,
    maxWeight: 8,
    minLength: 20,
    maxLength: 70,
  },
  {
    id: 'salmon',
    rarity: 'common',
    name: { en: 'Salmon', id: 'Ikan Salmon' },
    description: {
      en: 'A strong swimmer with a silver shine.',
      id: 'Perenang kuat dengan kilau keperakan.',
    },
    minWeight: 1,
    maxWeight: 12,
    minLength: 30,
    maxLength: 90,
  },
  {
    id: 'tropical_fish',
    rarity: 'uncommon',
    name: { en: 'Tropical Fish', id: 'Ikan Tropis' },
    description: {
      en: 'A tiny splash of color.',
      id: 'Percikan warna yang mungil.',
    },
    minWeight: 0.1,
    maxWeight: 1.5,
    minLength: 5,
    maxLength: 25,
  },
  {
    id: 'pufferfish',
    rarity: 'uncommon',
    name: { en: 'Pufferfish', id: 'Ikan Buntal' },
    description: {
      en: 'Handle with care.',
      id: 'Pegang dengan hati-hati.',
    },
    minWeight: 0.3,
    maxWeight: 2.5,
    minLength: 10,
    maxLength: 35,
  },
  {
    id: 'nautilus_shell',
    rarity: 'uncommon',
    name: { en: 'Nautilus Shell', id: 'Cangkang Nautilus' },
    description: {
      en: 'A perfect spiral from the deep.',
      id: 'Spiral sempurna dari kedalaman.',
    },
    minWeight: 0.2,
    maxWeight: 1,
    minLength: 8,
    maxLength: 20,
  },
  {
    id: 'enchanted_book',
    rarity: 'rare',
    name: { en: 'Enchanted Book', id: 'Buku Terpesona' },
    description: {
      en: 'The pages hum with old magic.',
      id: 'Halamannya bergetar dengan sihir kuno.',
    },
    minWeight: 0.5,
    maxWeight: 1.5,
    minLength: 15,
    maxLength: 25,
  },
  {
    id: 'name_tag',
    rarity: 'rare',
    name: { en: 'Name Tag', id: 'Label Nama' },
    description: {
      en: 'Someone lost their name.',
      id: 'Seseorang kehilangan namanya.',
    },
    minWeight: 0.02,
    maxWeight: 0.1,
    minLength: 3,
    maxLength: 8,
  },
  {
    id: 'prismarine_shard',
    rarity: 'rare',
    name: { en: 'Prismarine Shard', id: 'Pecahan Prismarine' },
    description: {
      en: 'A shard of the ocean monument.',
      id: 'Pecahan dari monumen laut.',
    },
    minWeight: 0.1,
    maxWeight: 0.5,
    minLength: 5,
    maxLength: 15,
  },
  {
    id: 'heart_of_the_sea',
    rarity: 'legendary',
    name: { en: 'Heart of the Sea', id: 'Jantung Laut' },
    description: {
      en: "The ocean's greatest treasure.",
      id: 'Harta terbesar dari lautan.',
    },
    minWeight: 1,
    maxWeight: 4,
    minLength: 15,
    maxLength: 30,
  },
  {
    id: 'ancient_scale',
    rarity: 'legendary',
    name: { en: 'Ancient Scale', id: 'Sisik Kuno' },
    description: {
      en: 'A scale from something very old.',
      id: 'Sisik dari sesuatu yang sangat tua.',
    },
    minWeight: 3,
    maxWeight: 10,
    minLength: 40,
    maxLength: 90,
  },
  {
    id: 'echo_fish',
    rarity: 'mythic',
    secret: true,
    requires: 'echo_shard',
    name: { en: 'Echo Fish', id: 'Ikan Gema' },
    description: {
      en: 'It hums with a sound from below bedrock.',
      id: 'Ia bergetar dengan suara dari bawah bedrock.',
    },
    minWeight: 5,
    maxWeight: 20,
    minLength: 60,
    maxLength: 140,
  },
]

export const FISH_BY_ID = Object.fromEntries(
  FISH.map((fish) => [fish.id, fish]),
) as Record<FishId, FishDef>

export const ROD_BY_ID = Object.fromEntries(
  RODS.map((rod) => [rod.id, rod]),
) as Record<RodId, RodDef>

export const RARITY_LABEL_KEY: Record<Rarity, TranslationKey> = {
  common: 'rarity_common',
  uncommon: 'rarity_uncommon',
  rare: 'rarity_rare',
  legendary: 'rarity_legendary',
  mythic: 'rarity_mythic',
}

export const SIZE_LABEL_KEY: Record<FishSize, TranslationKey> = {
  tiny: 'size_tiny',
  small: 'size_small',
  average: 'size_average',
  large: 'size_large',
  trophy: 'size_trophy',
}

const RARITY_WEIGHT: Record<Exclude<Rarity, 'mythic'>, number> = {
  common: 55,
  uncommon: 25,
  rare: 13,
  legendary: 5,
}

const RARITY_ORDER: Rarity[] = ['common', 'uncommon', 'rare', 'legendary']

export function createInitialFishingState(): FishingState {
  return {
    version: 1,
    rods: ['basic'],
    selectedRod: 'basic',
    chest: [],
    discovered: {},
    materials: {},
    materialsFound: [],
    materialCatches: 0,
    starterClaimed: false,
    effects: { emberBait: 0, luck: 0 },
    pendingBrew: null,
    stats: {
      casts: 0,
      catches: 0,
      escapes: 0,
      currentStreak: 0,
      bestStreak: 0,
      totalWeight: 0,
    },
  }
}

export function speciesCount(state: FishingState) {
  return Object.keys(state.discovered).length
}

export function checkRodUnlocks(state: FishingState): RodId[] {
  const species = speciesCount(state)
  return RODS.filter((rod) => {
    if (!rod.requirement) return false
    if (state.rods.includes(rod.id)) return false
    const current =
      rod.requirement.metric === 'catches'
        ? state.stats.catches
        : species
    return current >= rod.requirement.count
  }).map((rod) => rod.id)
}

export function rodRequirementProgress(state: FishingState, rod: RodDef) {
  if (!rod.requirement) return { current: 1, target: 1 }
  const current =
    rod.requirement.metric === 'catches'
      ? state.stats.catches
      : speciesCount(state)
  return { current, target: rod.requirement.count }
}

export function rollFishingCatch(
  rod: RodDef,
  hasSecretBait: boolean,
  secretAlreadyCaught: boolean,
  effects: FishingEffects = { emberBait: 0, luck: 0 },
): FishingRoll {
  if (hasSecretBait && !secretAlreadyCaught) {
    return { kind: 'fish', roll: rollForFish(FISH_BY_ID.echo_fish) }
  }

  const materialChance = Math.min(
    0.5,
    MATERIAL_CATCH_CHANCE + rod.luck * 0.05 + (effects.emberBait > 0 ? 0.22 : 0),
  )
  if (Math.random() < materialChance) {
    return {
      kind: 'material',
      material: rollMaterial(rod.luck),
      amount: 1,
    }
  }

  return { kind: 'fish', roll: rollCatch({ ...rod, luck: rod.luck + (effects.luck > 0 ? 0.8 : 0) }, false, false) }
}

export function rollCatch(
  rod: RodDef,
  hasSecretBait: boolean,
  secretAlreadyCaught: boolean,
): CatchRoll {
  if (hasSecretBait && !secretAlreadyCaught) {
    return rollForFish(FISH_BY_ID.echo_fish)
  }

  const weights = {
    common: RARITY_WEIGHT.common,
    uncommon: RARITY_WEIGHT.uncommon,
    rare: RARITY_WEIGHT.rare * (1 + rod.luck),
    legendary: RARITY_WEIGHT.legendary * (1 + rod.luck * 1.8),
  }
  const total = Object.values(weights).reduce((sum, value) => sum + value, 0)
  let ticket = Math.random() * total
  let rarity: Rarity = 'common'
  for (const candidate of RARITY_ORDER) {
    ticket -= weights[candidate as keyof typeof weights]
    if (ticket <= 0) {
      rarity = candidate
      break
    }
  }

  const pool = FISH.filter((fish) => !fish.secret && fish.rarity === rarity)
  const fish = pool[Math.floor(Math.random() * pool.length)] ?? FISH[0]
  return rollForFish(fish)
}

function rollForFish(fish: FishDef): CatchRoll {
  const weight =
    fish.minWeight + Math.random() * (fish.maxWeight - fish.minWeight)
  const length =
    fish.minLength + Math.random() * (fish.maxLength - fish.minLength)
  const weightPercentile =
    (weight - fish.minWeight) / (fish.maxWeight - fish.minWeight)
  const lengthPercentile =
    (length - fish.minLength) / (fish.maxLength - fish.minLength)
  const percentile = (weightPercentile + lengthPercentile) / 2

  return {
    species: fish.id,
    rarity: fish.rarity,
    weight: Math.round(weight * 10) / 10,
    length: Math.round(length),
    size: sizeFromPercentile(percentile),
  }
}

function sizeFromPercentile(percentile: number): FishSize {
  if (percentile < 0.12) return 'tiny'
  if (percentile < 0.35) return 'small'
  if (percentile < 0.65) return 'average'
  if (percentile < 0.88) return 'large'
  return 'trophy'
}

export function loadFishingState(): FishingState {
  const initial = createInitialFishingState()
  try {
    const raw = window.localStorage.getItem(FISHING_STORAGE_KEY)
    if (!raw) return initial
    const parsed = JSON.parse(raw) as Partial<FishingState>
    const rods = Array.isArray(parsed.rods)
      ? parsed.rods.filter(isRodId)
      : []
    if (!rods.includes('basic')) rods.unshift('basic')

    const selectedRod =
      isRodId(parsed.selectedRod) && rods.includes(parsed.selectedRod)
        ? parsed.selectedRod
        : 'basic'

    const chest = Array.isArray(parsed.chest)
      ? parsed.chest.filter(isFishCatch).slice(-MAX_CHEST_SIZE)
      : []

    const discovered: Partial<Record<FishId, FishRecord>> = {}
    if (parsed.discovered && typeof parsed.discovered === 'object') {
      for (const [key, value] of Object.entries(parsed.discovered)) {
        if (!isFishId(key) || !value || typeof value !== 'object') continue
        const record = value as Partial<FishRecord>
        if (
          typeof record.count !== 'number' ||
          typeof record.bestWeight !== 'number' ||
          typeof record.bestLength !== 'number' ||
          !isFishSize(record.bestSize)
        ) {
          continue
        }
        discovered[key] = {
          count: Math.max(0, Math.floor(record.count)),
          bestWeight: record.bestWeight,
          bestLength: record.bestLength,
          bestSize: record.bestSize,
        }
      }
    }

    const materials: Partial<Record<MaterialId, number>> = {}
    if (parsed.materials && typeof parsed.materials === 'object') {
      for (const [key, value] of Object.entries(parsed.materials)) {
        if (!isMaterialId(key) || typeof value !== 'number') continue
        if (!Number.isFinite(value)) continue
        materials[key] = Math.max(0, Math.floor(value))
      }
    }

    // Restore escrow on reload: leaving an unfinished brew never loses ingredients.
    if (parsed.pendingBrew?.cost && typeof parsed.pendingBrew.cost === 'object') {
      for (const [id, amount] of Object.entries(parsed.pendingBrew.cost)) {
        if (isMaterialId(id)) materials[id] = (materials[id] ?? 0) + safeCount(amount)
      }
    }
    const materialsFound = Array.from(new Set([
      ...(Array.isArray(parsed.materialsFound) ? parsed.materialsFound.filter(isMaterialId) : []),
      ...Object.keys(materials).filter((id) => isMaterialId(id) && (materials[id] ?? 0) > 0) as MaterialId[],
    ]))
    const stats = { ...initial.stats }
    if (parsed.stats && typeof parsed.stats === 'object') {
      for (const key of Object.keys(stats) as (keyof FishingStats)[]) {
        const value = parsed.stats[key]
        if (typeof value === 'number' && Number.isFinite(value)) {
          stats[key] = Math.max(0, value)
        }
      }
    }

    return {
      version: 1,
      rods,
      selectedRod,
      chest,
      discovered,
      materials,
      materialsFound,
      materialCatches: safeCount(parsed.materialCatches ?? Object.values(materials).reduce((sum, amount) => sum + amount, 0)),
      starterClaimed: parsed.starterClaimed === true,
      effects: { emberBait: safeCount(parsed.effects?.emberBait), luck: safeCount(parsed.effects?.luck) },
      pendingBrew: null,
      stats,
    }
  } catch {
    return initial
  }
}

export function saveFishingState(state: FishingState) {
  try {
    window.localStorage.setItem(FISHING_STORAGE_KEY, JSON.stringify(state))
  } catch {
    /* Storage disabled: the session still works. */
  }
}

export function formatWeight(weight: number) {
  return `${weight.toFixed(1)} kg`
}

export function formatLength(length: number) {
  return `${Math.round(length)} cm`
}

function isRodId(value: unknown): value is RodId {
  return typeof value === 'string' && value in ROD_BY_ID
}

function isFishId(value: unknown): value is FishId {
  return typeof value === 'string' && value in FISH_BY_ID
}

function isRarity(value: unknown): value is Rarity {
  return (
    value === 'common' ||
    value === 'uncommon' ||
    value === 'rare' ||
    value === 'legendary' ||
    value === 'mythic'
  )
}

function isFishSize(value: unknown): value is FishSize {
  return (
    value === 'tiny' ||
    value === 'small' ||
    value === 'average' ||
    value === 'large' ||
    value === 'trophy'
  )
}

function isFishCatch(value: unknown): value is FishCatch {
  if (!value || typeof value !== 'object') return false
  const fish = value as Partial<FishCatch>
  return (
    typeof fish.id === 'string' &&
    isFishId(fish.species) &&
    isRarity(fish.rarity) &&
    typeof fish.weight === 'number' &&
    typeof fish.length === 'number' &&
    isFishSize(fish.size) &&
    isRodId(fish.rod) &&
    typeof fish.caughtAt === 'number'
  )
}

export function safeCount(value: unknown): number {
  return typeof value === 'number' && Number.isFinite(value) ? Math.max(0, Math.floor(value)) : 0
}

export function spendCastEffects(state: FishingState): FishingState {
  return {
    ...state,
    effects: { emberBait: Math.max(0, state.effects.emberBait - 1), luck: Math.max(0, state.effects.luck - 1) },
    stats: { ...state.stats, casts: state.stats.casts + 1 },
  }
}

export function reserveIngredients(state: FishingState, id: string, cost: MaterialBag): FishingState | null {
  if (state.pendingBrew || !Object.keys(cost).length) return null
  const materials = { ...state.materials }
  for (const [key, amount] of Object.entries(cost)) {
    if (!isMaterialId(key) || !Number.isInteger(amount) || amount < 1 || (materials[key] ?? 0) < amount) return null
    materials[key] = (materials[key] ?? 0) - amount
  }
  return { ...state, materials, pendingBrew: { id, cost } }
}

export function settleIngredients(
  state: FishingState, id: string, refund: MaterialBag, reward: FishingEffects,
): FishingState | null {
  if (state.pendingBrew?.id !== id) return null
  const materials = { ...state.materials }
  for (const [key, amount] of Object.entries(refund)) {
    if (isMaterialId(key)) {
      materials[key] = (materials[key] ?? 0) + Math.min(safeCount(amount), state.pendingBrew.cost[key] ?? 0)
    }
  }
  return {
    ...state, materials, pendingBrew: null,
    effects: { emberBait: state.effects.emberBait + safeCount(reward.emberBait), luck: state.effects.luck + safeCount(reward.luck) },
  }
}
