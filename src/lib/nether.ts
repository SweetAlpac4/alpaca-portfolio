import type { Localized } from '../data/types'
import type { MaterialId } from './materials'
import type { FishingEffects } from './fishing'

export type BrewRecipeId =
  | 'experience'
  | 'fire_resistance'
  | 'strength'
  | 'luck'

export type BrewQuality = 'ruined' | 'awkward' | 'good' | 'perfect'

export type BrewRecipe = {
  id: BrewRecipeId
  name: Localized
  description: Localized
  ingredients: [MaterialId, MaterialId, MaterialId]
  difficulty: 1 | 2 | 3
  unlockAt: number
}

export type BrewRecord = {
  brews: number
  perfects: number
  bestScore: number
}

export type NetherState = {
  version: 1
  brews: number
  perfects: number
  bestScore: number
  bestQuality: BrewQuality | null
  recipes: BrewRecipeId[]
  discovered: Partial<Record<BrewRecipeId, BrewRecord>>
  embers: number
  cleanBrews: number
  soulFlame: boolean
}

export const NETHER_STORAGE_KEY = 'portfolio-nether-v1'

export const BREW_RECIPES: BrewRecipe[] = [
  {
    id: 'experience',
    difficulty: 1,
    unlockAt: 0,
    ingredients: ['nether_wart', 'glowstone_dust', 'nether_quartz'],
    name: { en: 'Potion of Experience', id: 'Ramuan Pengalaman' },
    description: {
      en: 'A warm brew that hums with everything you have learned.',
      id: 'Ramuan hangat yang berdenyut dengan semua yang telah kamu pelajari.',
    },
  },
  {
    id: 'fire_resistance',
    difficulty: 1,
    unlockAt: 1,
    ingredients: ['nether_wart', 'magma_cream', 'blaze_powder'],
    name: { en: 'Potion of Fire Resistance', id: 'Ramuan Tahan Api' },
    description: {
      en: 'For the days when the whole world feels like a furnace.',
      id: 'Untuk hari-hari ketika seluruh dunia terasa seperti tungku.',
    },
  },
  {
    id: 'strength',
    difficulty: 2,
    unlockAt: 3,
    ingredients: ['blaze_powder', 'nether_quartz', 'ghast_tear'],
    name: { en: 'Potion of Strength', id: 'Ramuan Kekuatan' },
    description: {
      en: 'Bottled courage for the work that needs both hands.',
      id: 'Keberanian dalam botol untuk pekerjaan yang butuh dua tangan.',
    },
  },
  {
    id: 'luck',
    difficulty: 3,
    unlockAt: 5,
    ingredients: ['ghast_tear', 'glowstone_dust', 'nether_quartz'],
    name: { en: 'Potion of Luck', id: 'Ramuan Keberuntungan' },
    description: {
      en: 'A rare shimmer that makes the next cast feel full of possibility.',
      id: 'Kilau langka yang membuat lemparan berikutnya terasa penuh kemungkinan.',
    },
  },
]

export const RECIPE_BY_ID = Object.fromEntries(
  BREW_RECIPES.map((recipe) => [recipe.id, recipe]),
) as Record<BrewRecipeId, BrewRecipe>

const QUALITY_RANK: Record<BrewQuality, number> = {
  ruined: 0,
  awkward: 1,
  good: 2,
  perfect: 3,
}

export function createInitialNetherState(): NetherState {
  return {
    version: 1,
    brews: 0,
    perfects: 0,
    bestScore: 0,
    bestQuality: null,
    recipes: ['experience'],
    discovered: {},
    embers: 0,
    cleanBrews: 0,
    soulFlame: false,
  }
}

export function isBrewRecipeId(value: unknown): value is BrewRecipeId {
  return typeof value === 'string' && Object.prototype.hasOwnProperty.call(RECIPE_BY_ID, value)
}

export function isBrewQuality(value: unknown): value is BrewQuality {
  return (
    value === 'ruined' ||
    value === 'awkward' ||
    value === 'good' ||
    value === 'perfect'
  )
}

export function brewCost(
  recipe: BrewRecipe,
): Partial<Record<MaterialId, number>> {
  const cost: Partial<Record<MaterialId, number>> = {}
  for (const ingredient of recipe.ingredients) {
    cost[ingredient] = (cost[ingredient] ?? 0) + 1
  }
  return cost
}

export function unlockedRecipesForBrews(brews: number): BrewRecipeId[] {
  return BREW_RECIPES.filter((recipe) => recipe.unlockAt <= brews).map(
    (recipe) => recipe.id,
  )
}

export function scoreToQuality(score: number): BrewQuality {
  if (score >= 88) return 'perfect'
  if (score >= 62) return 'good'
  if (score >= 35) return 'awkward'
  return 'ruined'
}

export function betterQuality(
  current: BrewQuality | null,
  next: BrewQuality,
): BrewQuality {
  if (!current) return next
  return QUALITY_RANK[next] > QUALITY_RANK[current] ? next : current
}

export function loadNetherState(): NetherState {
  const initial = createInitialNetherState()
  try {
    const raw = window.localStorage.getItem(NETHER_STORAGE_KEY)
    if (!raw) return initial
    const parsed = JSON.parse(raw) as Partial<NetherState>
    const recipes: BrewRecipeId[] = Array.isArray(parsed.recipes)
      ? Array.from(
          new Set(parsed.recipes.filter(isBrewRecipeId)),
        )
      : ['experience']
    if (!recipes.includes('experience')) recipes.unshift('experience')

    const discovered: Partial<Record<BrewRecipeId, BrewRecord>> = {}
    if (parsed.discovered && typeof parsed.discovered === 'object') {
      for (const [key, value] of Object.entries(parsed.discovered)) {
        if (!isBrewRecipeId(key) || !value || typeof value !== 'object') {
          continue
        }
        const record = value as Partial<BrewRecord>
        if (
          typeof record.brews !== 'number' ||
          typeof record.perfects !== 'number' ||
          typeof record.bestScore !== 'number' ||
          !Number.isFinite(record.brews) || !Number.isFinite(record.perfects) || !Number.isFinite(record.bestScore)
        ) {
          continue
        }
        discovered[key] = {
          brews: Math.max(0, Math.floor(record.brews)),
          perfects: Math.max(0, Math.floor(record.perfects)),
          bestScore: Math.max(0, Math.floor(record.bestScore)),
        }
      }
    }

    const number = (value: unknown) =>
      typeof value === 'number' && Number.isFinite(value)
        ? Math.max(0, Math.floor(value))
        : 0

    return {
      version: 1,
      brews: number(parsed.brews),
      perfects: number(parsed.perfects),
      bestScore: number(parsed.bestScore),
      bestQuality: isBrewQuality(parsed.bestQuality)
        ? parsed.bestQuality
        : null,
      recipes: Array.from(new Set([...recipes, ...unlockedRecipesForBrews(number(parsed.brews))])),
      discovered,
      embers: number(parsed.embers),
      cleanBrews: number(parsed.cleanBrews),
      soulFlame: parsed.soulFlame === true && number(parsed.perfects) >= 5,
    }
  } catch {
    return initial
  }
}

export function saveNetherState(state: NetherState) {
  try {
    window.localStorage.setItem(NETHER_STORAGE_KEY, JSON.stringify(state))
  } catch {
    /* Storage disabled: the session still works. */
  }
}

export function brewReward(recipe: BrewRecipeId, quality: BrewQuality): FishingEffects {
  if (quality === 'ruined' || quality === 'awkward') return { emberBait: 0, luck: 0 }
  const casts = (recipe === 'fire_resistance' || recipe === 'luck' ? 8 : 5) + (quality === 'perfect' ? 2 : 0)
  return recipe === 'experience' || recipe === 'fire_resistance'
    ? { emberBait: casts, luck: 0 }
    : { emberBait: 0, luck: casts }
}

export function recordBrew(state: NetherState, recipe: BrewRecipeId, score: number, clean: boolean): NetherState {
  const quality = scoreToQuality(score)
  const successful = quality === 'good' || quality === 'perfect'
  const previous = state.discovered[recipe] ?? { brews: 0, perfects: 0, bestScore: 0 }
  return {
    ...state,
    brews: state.brews + 1,
    perfects: state.perfects + (quality === 'perfect' ? 1 : 0),
    bestScore: Math.max(state.bestScore, score),
    bestQuality: betterQuality(state.bestQuality, quality),
    recipes: Array.from(new Set([...state.recipes, ...unlockedRecipesForBrews(state.brews + 1)])),
    discovered: {
      ...state.discovered,
      [recipe]: { brews: previous.brews + (successful ? 1 : 0), perfects: previous.perfects + (quality === 'perfect' ? 1 : 0), bestScore: Math.max(previous.bestScore, score) },
    },
    cleanBrews: state.cleanBrews + (clean ? 1 : 0),
    embers: state.embers + (quality === 'perfect' ? 1 : 0),
  }
}
