import { BEAT_LIMIT, ENTRANCE, EXIT, tiles, sensor, adjacent, furnacePuzzle, toggleRune } from "../src/lib/deepDark.ts"
import { test } from 'node:test'
import assert from 'node:assert/strict'
import { createInitialFishingState, FISH, FISHING_STORAGE_KEY, loadFishingState, RODS, rollFishingCatch, saveFishingState, reserveIngredients, settleIngredients, spendCastEffects } from '../src/lib/fishing.ts'
import { brewCost, brewReward, createInitialNetherState, loadNetherState, NETHER_STORAGE_KEY, recordBrew, RECIPE_BY_ID, scoreToQuality } from '../src/lib/nether.ts'
import { advanceBrew, BREW_DURATION, createBrewSession, currentBeat, finishBrew, markerPosition, tapIngredient, ventBrew } from '../src/lib/brewSession.ts'
import { gameMilestones } from '../src/lib/gameMilestones.ts'
import { MATERIALS } from '../src/lib/materials.ts'
import { SECRET_ENDING_ENABLED } from '../src/lib/features.ts'
import { addOreToState, BLOCK_WEIGHTS, canUpgrade, createInitialCaveState, CAVE_STORAGE_KEY, generateGrid, isReachable, loadCaveState, PICKAXES, resolveMine, upgradePickaxe } from '../src/lib/cave.ts'

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
  const secret = random(0, () => rollFishingCatch(RODS.find(rod => rod.id === 'warden'), true, false, { emberBait: 5, luck: 5 }))
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
  const milestones = gameMilestones(fishing, nether, createInitialCaveState())
  for (const id of ['fishing_rods', 'fishing_collection', 'rift_collector', 'brew_master', 'brew_clean']) assert.ok(milestones.includes(id))
  assert.ok(!milestones.includes('fishing_echo'))
  assert.equal(SECRET_ENDING_ENABLED, false)
})

test('Cave state starts empty, uses wood pickaxe, and serializes cleanly', () => {
  const cave = createInitialCaveState()
  assert.equal(cave.pickaxe, 'wood')
  assert.deepEqual(Object.values(cave.ores), [0, 0, 0, 0, 0, 0, 0])
  assert.doesNotThrow(() => JSON.stringify(cave))
})

test('generated mining grid has 49 valid cells, coal in the shallow rows, and no row-one lava', () => {
  const valid = new Set(['stone', 'coal', 'iron', 'gold', 'redstone', 'lapis', 'diamond', 'voidsteel', 'gravel', 'lava', 'nether_quartz', 'glowstone_dust'])
  const grid = generateGrid('diamond', () => 0.999)
  assert.equal(grid.length, 49)
  assert.deepEqual([...new Set(grid.map(block => block.row))], [1, 2, 3, 4, 5, 6, 7])
  assert.deepEqual([...new Set(grid.map(block => block.col))], [1, 2, 3, 4, 5, 6, 7])
  assert.ok(grid.every(block => valid.has(block.content)))
  assert.ok(grid.filter(block => block.row === 1).every(block => block.content !== 'lava'))
  assert.ok(grid.filter(block => block.row <= 3 && block.content === 'coal').length >= 2)
  assert.ok(grid.filter(block => block.row <= 3).every(block => !['nether_quartz', 'glowstone_dust'].includes(block.content)))
  for (const weights of Object.values(BLOCK_WEIGHTS)) assert.equal(Object.values(weights).reduce((sum, value) => sum + value, 0), 100)
  for (let seed = 0; seed < 12; seed++) {
    let cursor = seed
    const sample = generateGrid('iron', () => ((cursor++ * 0.137) % 100) / 100)
    assert.ok(sample.every(block => valid.has(block.content)))
    assert.ok(sample.filter(block => block.row <= 3).every(block => block.content !== 'nether_quartz' && block.content !== 'glowstone_dust'))
  }
})

test('mining route starts at the surface and extends only through neighboring cells', () => {
  const grid = generateGrid('wood', () => 0)
  const cell = (row, col) => grid.find(block => block.row === row && block.col === col)
  assert.equal(isReachable(cell(1, 1), grid, 3), true)
  assert.equal(isReachable(cell(2, 1), grid, 3), false)
  assert.equal(isReachable(cell(4, 1), grid, 3), false)
  grid[0] = { ...grid[0], mined: true }
  assert.equal(isReachable(cell(1, 2), grid, 3), true)
  assert.equal(isReachable(cell(2, 1), grid, 3), true)
  assert.equal(isReachable(cell(2, 2), grid, 3), false)
  assert.equal(isReachable(cell(1, 3), grid, 3), false)
})

test('mining costs and combo score resolve by block and depth', () => {
  const block = (content, row = 3) => ({ id: 'test', row, col: 1, content, mined: false })
  const lava = resolveMine(block('lava'), 8, 6, () => 0)
  assert.equal(lava.durabilityCost, 4); assert.equal(lava.combo, 0)
  const gravel = resolveMine(block('gravel'), 8, 4, () => 0)
  assert.equal(gravel.durabilityCost, 2); assert.equal(gravel.combo, 0)
  const stone = resolveMine(block('stone'), 8, 4, () => 0)
  assert.equal(stone.durabilityCost, 1)
  const ore = resolveMine(block('coal'), 8, 2, () => 0)
  assert.equal(ore.combo, 3); assert.equal(ore.score, 4)
  assert.equal(resolveMine(block('diamond', 7), 8, 0, () => 0).score, 83)
})

test('pickaxe upgrades spend exact ore costs without erasing lifetime discoveries', () => {
  const initial = createInitialCaveState()
  assert.equal(canUpgrade(initial), false)
  assert.equal(upgradePickaxe(initial), null)
  const stoneReady = { ...initial, ores: { ...initial.ores, coal: 8 }, foundOres: ['coal'] }
  const stone = upgradePickaxe(stoneReady)
  assert.equal(stone.pickaxe, 'stone'); assert.equal(stone.ores.coal, 0); assert.deepEqual(stone.foundOres, ['coal'])
  const ironReady = { ...stone, ores: { ...stone.ores, coal: 16, iron: 8 }, foundOres: ['coal', 'iron'] }
  const iron = upgradePickaxe(ironReady)
  assert.equal(iron.pickaxe, 'iron'); assert.equal(iron.ores.coal, 0); assert.equal(iron.ores.iron, 0)
  const diamondReady = { ...iron, ores: { ...iron.ores, coal: 16, iron: 10, diamond: 2 }, foundOres: ['coal', 'iron', 'diamond'] }
  const diamond = upgradePickaxe(diamondReady)
  assert.equal(diamond.pickaxe, 'diamond'); assert.equal(diamond.ores.diamond, 0)
  assert.deepEqual(diamond.foundOres, ['coal', 'iron', 'diamond'])
  assert.equal(PICKAXES.diamond.maxRow, 7); assert.equal(upgradePickaxe(diamond), null)
})

test('ore discovery and cave save loading are defensive', () => {
  const first = addOreToState(createInitialCaveState(), 'iron')
  const second = addOreToState(first, 'iron', 2)
  assert.equal(second.totalOres, 3); assert.deepEqual(second.foundOres, ['iron'])
  storage.set(CAVE_STORAGE_KEY, '{broken json')
  assert.equal(loadCaveState().pickaxe, 'wood')
  storage.set(CAVE_STORAGE_KEY, JSON.stringify({ pickaxe: 'impossible', ores: { coal: -10, iron: 'x' }, totalOres: -2, foundOres: ['bad', 'diamond', 'diamond'], runs: 3.9 }))
  const loaded = loadCaveState()
  assert.equal(loaded.pickaxe, 'wood'); assert.equal(loaded.ores.coal, 0); assert.equal(loaded.totalOres, 0)
  assert.deepEqual(loaded.foundOres, ['diamond']); assert.equal(loaded.runs, 3)
})

test('Cave milestones unlock for a fully progressed miner', () => {
  const fishing = createInitialFishingState()
  const nether = createInitialNetherState()
  const cave = { ...createInitialCaveState(), pickaxe: 'diamond', totalOres: 100, foundOres: ['coal', 'iron', 'gold', 'redstone', 'lapis', 'diamond', 'voidsteel'], bestCombo: 8, cleanRuns: 1, quartzMined: 1, glowstoneMined: 1 }
  const milestones = gameMilestones(fishing, nether, cave)
  for (const id of ['cave_first_ore', 'cave_100', 'cave_all_ores', 'cave_pickaxe', 'cave_find_diamond', 'cave_combo', 'cave_clean', 'cave_geologist']) assert.ok(milestones.includes(id))
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

test('the Silent Steps shard can be carried home before timeout without an alarm', () => {
  let positions = [{ pos: ENTRANCE, carrying: false }]
  for (let beat = 0; beat < BEAT_LIMIT; beat++) {
    const next = new Map()
    for (const { pos, carrying } of positions) {
      for (let dest = 0; dest < tiles.length; dest++) {
        if (tiles[dest] === '#' || (dest !== pos && !adjacent(pos, dest))) continue
        if ([beat, beat + 1].some(b => sensor(dest, b) === 'pulse')) continue
        if (dest === ENTRANCE && carrying) return
        const hasShard = carrying || dest === EXIT
        next.set(dest + ':' + hasShard, { pos: dest, carrying: hasShard })
      }
    }
    positions = [...next.values()]
  }
  assert.fail('No clean round trip within the beat limit')
})

test('furnace scrambles have a five-move solution', () => {
  const chosen = []
  const cells = Array.from({ length: 9 }, (_, i) => i)
  const scramble = furnacePuzzle(() => {
    const fraction = .42
    chosen.push(...cells.splice(Math.floor(cells.length * fraction), 1))
    return fraction
  })
  assert.notEqual(scramble, 511)
  assert.equal(chosen.reduce(toggleRune, scramble), 511)
})

test('endgame progression gates the ore, potion and Echo Fish', () => {
  for (let row = 1; row <= 7; row++) assert.equal(BLOCK_WEIGHTS[row].voidsteel ?? 0, row === 7 ? 5 : 0)
  let nether = createInitialNetherState()
  for (let i = 0; i < 8; i++) nether = recordBrew(nether, 'experience', 80, false)
  assert.ok(nether.recipes.includes('resonance'))
  assert.equal(recordBrew(nether, 'resonance', 60, false).resonance, 0)
  assert.equal(recordBrew(nether, 'resonance', 80, false).resonance, 1)
  const rod = RODS.find(r => r.id === 'warden')
  const old = random(0, () => rollFishingCatch(RODS[0], true, false))
  assert.notEqual(old.roll?.species, 'echo_fish')
  let fishing = { ...createInitialFishingState(), selectedRod: rod.id, rods: ['basic', rod.id] }
  for (let i = 1; i <= 7; i++) {
    fishing = spendCastEffects(fishing)
    assert.equal(fishing.wardenCasts, Math.min(i, 5))
  }
  saveFishingState(fishing)
  assert.equal(loadFishingState().wardenCasts, 5)
})
