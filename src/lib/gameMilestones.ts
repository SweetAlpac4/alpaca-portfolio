import { FISH, RODS, type FishingState } from './fishing.ts'
import { BREW_RECIPES, type NetherState } from './nether.ts'
import { MATERIALS } from './materials.ts'
import type { AchievementId } from './achievements'

export function gameMilestones(fishing: FishingState, nether: NetherState): AchievementId[] {
  const matches: [AchievementId, boolean][] = [
    ['fishing_first', fishing.stats.catches >= 1],
    ['fishing_25', fishing.stats.catches >= 25],
    ['fishing_rods', RODS.every(rod => fishing.rods.includes(rod.id))],
    ['fishing_collection', FISH.filter(fish => !fish.secret).every(fish => (fishing.discovered[fish.id]?.count ?? 0) > 0)],
    ['fishing_echo', (fishing.discovered.echo_fish?.count ?? 0) > 0],
    ['rift_first', fishing.materialCatches > 0],
    ['rift_collector', MATERIALS.every(item => fishing.materialsFound.includes(item.id))],
    ['brew_first', Object.values(nether.discovered).some(record => record.brews > 0)],
    ['brew_perfect', nether.perfects >= 1],
    ['brew_master', nether.perfects >= 5],
    ['brew_recipes', BREW_RECIPES.every(recipe => nether.recipes.includes(recipe.id))],
    ['brew_collection', BREW_RECIPES.every(recipe => (nether.discovered[recipe.id]?.brews ?? 0) > 0)],
    ['brew_clean', nether.cleanBrews > 0],
  ]
  return matches.filter(([, complete]) => complete).map(([id]) => id)
}
