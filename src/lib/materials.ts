import type { Localized } from '../data/types'

export type MaterialId =
  | 'nether_wart'
  | 'glowstone_dust'
  | 'nether_quartz'
  | 'magma_cream'
  | 'blaze_powder'
  | 'ghast_tear'

export type MaterialRarity = 'common' | 'uncommon' | 'rare' | 'legendary'

export type MaterialDef = {
  id: MaterialId
  name: Localized
  description: Localized
  rarity: MaterialRarity
  color: string
}

export type MaterialDrop = {
  material: MaterialId
  amount: number
}

export const MATERIALS: MaterialDef[] = [
  {
    id: 'nether_wart',
    rarity: 'common',
    color: '#9f2f3f',
    name: { en: 'Nether Wart', id: 'Nether Wart' },
    description: {
      en: 'A crimson growth that thrives in heat.',
      id: 'Tanaman merah yang tumbuh subur dalam panas.',
    },
  },
  {
    id: 'glowstone_dust',
    rarity: 'common',
    color: '#f0c655',
    name: { en: 'Glowstone Dust', id: 'Debu Glowstone' },
    description: {
      en: 'Warm, golden dust that refuses to go dark.',
      id: 'Debu keemasan hangat yang menolak padam.',
    },
  },
  {
    id: 'nether_quartz',
    rarity: 'uncommon',
    color: '#e7e2d2',
    name: { en: 'Nether Quartz', id: 'Kuarsa Nether' },
    description: {
      en: 'A pale crystal with a steady inner pulse.',
      id: 'Kristal pucat dengan denyut halus di dalamnya.',
    },
  },
  {
    id: 'magma_cream',
    rarity: 'rare',
    color: '#e66a32',
    name: { en: 'Magma Cream', id: 'Krim Magma' },
    description: {
      en: 'A sticky ember that never truly cools.',
      id: 'Bara lengket yang tidak pernah benar-benar dingin.',
    },
  },
  {
    id: 'blaze_powder',
    rarity: 'rare',
    color: '#ff9d3d',
    name: { en: 'Blaze Powder', id: 'Bubuk Blaze' },
    description: {
      en: 'A handful of controlled fury.',
      id: 'Segenggam amarah yang terkendali.',
    },
  },
  {
    id: 'ghast_tear',
    rarity: 'legendary',
    color: '#b9edf4',
    name: { en: 'Ghast Tear', id: 'Air Mata Ghast' },
    description: {
      en: 'A cold tear from something that never wanted to cry.',
      id: 'Tetes dingin dari sesuatu yang tak pernah ingin menangis.',
    },
  },
]

export const MATERIAL_BY_ID = Object.fromEntries(
  MATERIALS.map((material) => [material.id, material]),
) as Record<MaterialId, MaterialDef>

const MATERIAL_WEIGHTS: Record<MaterialRarity, number> = {
  common: 52,
  uncommon: 28,
  rare: 15,
  legendary: 5,
}

const MATERIAL_ORDER: MaterialRarity[] = [
  'common',
  'uncommon',
  'rare',
  'legendary',
]

export const MATERIAL_CATCH_CHANCE = 0.14

export function isMaterialId(value: unknown): value is MaterialId {
  return typeof value === 'string' && Object.prototype.hasOwnProperty.call(MATERIAL_BY_ID, value)
}

export function isMaterialRarity(value: unknown): value is MaterialRarity {
  return (
    value === 'common' ||
    value === 'uncommon' ||
    value === 'rare' ||
    value === 'legendary'
  )
}

export function rollMaterial(rodLuck = 0): MaterialId {
  const weights = {
    common: MATERIAL_WEIGHTS.common,
    uncommon: MATERIAL_WEIGHTS.uncommon,
    rare: MATERIAL_WEIGHTS.rare * (1 + rodLuck),
    legendary: MATERIAL_WEIGHTS.legendary * (1 + rodLuck * 1.8),
  }
  const total = Object.values(weights).reduce((sum, value) => sum + value, 0)
  let ticket = Math.random() * total
  let rarity: MaterialRarity = 'common'
  for (const candidate of MATERIAL_ORDER) {
    ticket -= weights[candidate]
    if (ticket <= 0) {
      rarity = candidate
      break
    }
  }
  const pool = MATERIALS.filter((material) => material.rarity === rarity)
  return (pool[Math.floor(Math.random() * pool.length)] ?? MATERIALS[0]).id
}

export function materialCount(
  materials: Partial<Record<MaterialId, number>> | undefined,
  id: MaterialId,
) {
  return Math.max(0, materials?.[id] ?? 0)
}

export function materialTypesFound(
  materials: Partial<Record<MaterialId, number>> | undefined,
) {
  return MATERIALS.filter((material) => materialCount(materials, material.id) > 0)
    .length
}

export function hasMaterials(
  materials: Partial<Record<MaterialId, number>> | undefined,
  cost: Partial<Record<MaterialId, number>>,
) {
  return MATERIALS.every((material) => {
    const required = cost[material.id] ?? 0
    return materialCount(materials, material.id) >= required
  })
}
