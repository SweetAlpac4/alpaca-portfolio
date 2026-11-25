import { test } from 'node:test'
import assert from 'node:assert/strict'
import { createInitialFishingState, FISH, FISHING_STORAGE_KEY, loadFishingState, RODS, rollFishingCatch, saveFishingState, reserveIngredients, settleIngredients, spendCastEffects } from '../src/lib/fishing.ts'
import { brewCost, brewReward, createInitialNetherState, loadNetherState, NETHER_STORAGE_KEY, recordBrew, RECIPE_BY_ID, scoreToQuality } from '../src/lib/nether.ts'
import { advanceBrew, BREW_DURATION, createBrewSession, currentBeat, finishBrew, markerPosition, tapIngredient, ventBrew } from '../src/lib/brewSession.ts'
import { gameMilestones } from '../src/lib/gameMilestones.ts'
import { MATERIALS } from '../src/lib/materials.ts'
import { SECRET_ENDING_ENABLED } from '../src/lib/features.ts'

const storage = new Map()
globalThis.window = { localStorage: { getItem: key => storage.get(key) ?? null, setItem: (key, value) => storage.set(key, value) } }

function random(value, action) {
  const original = Math.random
  Math.random = () => value
  try { return action() } finally { Math.random = original }
}

test('old fishing saves keep their fish, rods and progress, and gain an empty bag', () => {
  const old = { ...createInitialFishingState(), rods: ['basic', 'sturdy'], selectedRod: 'sturdy', stats: { ...createInitialFishingState().stats, catches: 6 } }
  for (const key of ['materials', 'materialsFound', 'materialCatches', 'starterClaimed', 'effects', 'pendingBrew']) delete old[key]
  storage.set(FISHING_STORAGE_KEY, JSON.stringify(old))
  const loaded = loadFishingState()
  assert.equal(loaded.stats.catches, 6)
  assert.equal(loaded.selectedRod, 'sturdy')
  assert.deepEqual(loaded.effects, { emberBait: 0, luck: 0 })
  assert.deepEqual(loaded.materials, {})
})

test('material catches replace fish, leave the fish pool intact, and Ember Bait changes odds', () => {
  assert.equal(random(0.1, () => rollFishingCatch(RODS[0], false, false)).kind, 'material')
  assert.equal(random(0.25, () => rollFishingCatch(RODS[0], false, false)).kind, 'fish')
  assert.equal(random(0.25, () => rollFishingCatch(RODS[0], false, false, { emberBait: 1, luck: 0 })).kind, 'material')
  assert.equal(FISH.length, 13)
  const secret = random(0, () => rollFishingCatch(RODS[0], true, false, { emberBait: 5, luck: 5 }))
  assert.equal(secret.kind, 'fish')
  assert.equal(secret.roll.species, 'echo_fish')
})

test('Luck changes rare fish odds and effects are spent exactly once per cast', () => {
  const normal = random(.76, () => rollFishingCatch(RODS[0], false, false))
  const boosted = random(.76, () => rollFishingCatch(RODS[0], false, false, { emberBait: 0, luck: 1 }))
  assert.equal(normal.kind, 'fish'); assert.equal(boosted.kind, 'fish')
  assert.equal(normal.roll.rarity, 'uncommon'); assert.equal(boosted.roll.rarity, 'rare')
  const state = { ...createInitialFishingState(), effects: { emberBait: 1, luck: 2 } }
  const next = spendCastEffects(state)
  assert.deepEqual(next.effects, { emberBait: 0, luck: 1 })
  assert.deepEqual(state.effects, { emberBait: 1, luck: 2 })
  assert.deepEqual(spendCastEffects(next).effects, { emberBait: 0, luck: 0 })
  assert.equal(next.stats.casts, 1)
})

test('ingredients reserve atomically, cannot overspend, and settle only once', () => {
  const cost = brewCost(RECIPE_BY_ID.experience)
  const state = { ...createInitialFishingState(), materials: { ...cost }, materialsFound: Object.keys(cost) }
  assert.equal(reserveIngredients(createInitialFishingState(), 'x', cost), null)
  assert.equal(reserveIngredients(state, 'x', { nether_wart: -1 }), null)
  const reserved = reserveIngredients(state, 'x', cost)
  assert.equal(reserved.materials.nether_wart, 0)
  assert.equal(state.materials.nether_wart, 1)
  assert.equal(reserveIngredients(reserved, 'y', cost), null)
  const settled = settleIngredients(reserved, 'x', {}, { emberBait: 5, luck: 0 })
  assert.deepEqual(settled.effects, { emberBait: 5, luck: 0 })
  assert.equal(settleIngredients(settled, 'x', {}, { emberBait: 5, luck: 0 }), null)
  assert.deepEqual(settled.materialsFound, state.materialsFound)
})

test('cancel or reload refunds an unfinished brew, never twice', () => {
  const cost = brewCost(RECIPE_BY_ID.experience)
  const state = { ...createInitialFishingState(), materials: { ...cost }, starterClaimed: true }
  const reserved = reserveIngredients(state, 'x', cost)
  const cancelled = settleIngredients(reserved, 'x', cost, { emberBait: 0, luck: 0 })
  assert.deepEqual(cancelled.materials, cost)
  saveFishingState(reserved)
  const recovered = loadFishingState()
  assert.deepEqual(recovered.materials, cost)
  assert.equal(recovered.pendingBrew, null)
  assert.equal(recovered.starterClaimed, true)
  saveFishingState(recovered)
  assert.deepEqual(loadFishingState().materials, cost)
})

test('no-input brewing completes, misses all nine doses and earns no reward', () => {
  const session = advanceBrew(createBrewSession(), BREW_DURATION, 1)
  const result = finishBrew(session)
  assert.equal(session.elapsed, BREW_DURATION)
  assert.deepEqual(session.hits, Array(9).fill(0))
  assert.equal(result.quality, 'ruined')
  assert.deepEqual(brewReward('experience', result.quality), { emberBait: 0, luck: 0 })
  assert.ok(session.overheats >= 1)
})

test('timing and temperature allow a perfect brew at every difficulty', () => {
  for (const difficulty of [1, 2, 3]) {
    let session = createBrewSession()
    while (session.elapsed < BREW_DURATION) {
      session = advanceBrew(session, 10, difficulty)
      if (session.heat > 67) session = ventBrew(session)
      if (session.hits[currentBeat(session)] === null && Math.abs(markerPosition(session.elapsed, difficulty) - 50) < 1) session = tapIngredient(session, difficulty)
    }
    const result = finishBrew(session)
    assert.equal(result.quality, 'perfect')
    assert.equal(result.clean, true)
    assert.equal(result.bestCombo, 9)
  }
})

test('vent has a cooldown, cannot overcool below zero, and duplicate taps do not score', () => {
  const session = advanceBrew(createBrewSession(), 590, 1)
  const first = tapIngredient(session, 1)
  assert.equal(tapIngredient(first, 1), first)
  const vented = ventBrew(session)
  assert.equal(ventBrew(vented), vented)
  assert.equal(ventBrew({ ...vented, elapsed: 3000, heat: 10 }).heat, 0)
})

test('progression unlocks four recipes, cosmetics, rewards, and lifetime achievements', () => {
  let nether = createInitialNetherState()
  for (let i = 0; i < 5; i++) nether = recordBrew(nether, 'experience', 95, true)
  assert.equal(nether.recipes.length, 4)
  assert.equal(nether.perfects, 5)
  assert.equal(nether.embers, 5)
  assert.deepEqual(brewReward('experience', 'perfect'), { emberBait: 7, luck: 0 })
  assert.deepEqual(brewReward('luck', 'good'), { emberBait: 0, luck: 8 })
  const fishing = { ...createInitialFishingState(), rods: RODS.map(rod => rod.id), materialsFound: MATERIALS.map(item => item.id) }
  fishing.discovered = Object.fromEntries(FISH.filter(fish => !fish.secret).map(fish => [fish.id, { count: 1 }]))
  const milestones = gameMilestones(fishing, nether)
  for (const id of ['fishing_rods', 'fishing_collection', 'rift_collector', 'brew_master', 'brew_recipes', 'brew_clean']) assert.ok(milestones.includes(id))
  assert.ok(!milestones.includes('fishing_echo'))
  assert.equal(SECRET_ENDING_ENABLED, false)
})

test('Nether save migration filters malformed records and derives recipe unlocks', () => {
  storage.set(NETHER_STORAGE_KEY, JSON.stringify({ brews: 5, perfects: -1, recipes: ['bad'], discovered: { experience: { brews: 'many' } } }))
  const loaded = loadNetherState()
  assert.equal(loaded.recipes.length, 4)
  assert.equal(loaded.perfects, 0)
  assert.deepEqual(loaded.discovered, {})
  assert.equal(scoreToQuality(88), 'perfect')
  assert.equal(scoreToQuality(62), 'good')
  assert.equal(scoreToQuality(35), 'awkward')
})

test('partial refunds return only the first ingredient and do not grant fishing effects', () => {
  const cost = brewCost(RECIPE_BY_ID.strength)
  const state = { ...createInitialFishingState(), materials: { ...cost } }
  const reserved = reserveIngredients(state, 'partial', cost)
  const refunded = settleIngredients(reserved, 'partial', { blaze_powder: 1 }, brewReward('strength', 'awkward'))
  assert.equal(refunded.materials.blaze_powder, 1)
  assert.equal(refunded.materials.nether_quartz, 0)
  assert.equal(refunded.materials.ghast_tear, 0)
  assert.deepEqual(refunded.effects, { emberBait: 0, luck: 0 })
})

test('delayed timer ticks still register missed doses and finish at exactly 36 seconds', () => {
  const initial = createBrewSession()
  let stepped = initial
  for (let i = 0; i < 720; i++) stepped = advanceBrew(stepped, 50, 2)
  const delayed = advanceBrew(initial, 60000, 2)
  assert.equal(delayed.elapsed, BREW_DURATION)
  assert.deepEqual(finishBrew(delayed), finishBrew(stepped))
  assert.deepEqual(delayed.hits, stepped.hits)
})
