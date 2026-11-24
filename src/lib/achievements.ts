import type { Localized } from '../data/types'
import type { SectionId } from '../data/sections'

export type AchievementId =
  | 'overworld_chest'
  | 'cave_diamond'
  | 'deepdark_sensor'
  | 'nether_blaze'
  | 'end_pearl'
  | 'credits_star'
  | 'curious_explorer'

export type PixelIconName =
  | 'book'
  | 'chest'
  | 'diamond'
  | 'sculk'
  | 'blaze'
  | 'pearl'
  | 'star'
  | 'trophy'

export type AchievementDef = {
  id: AchievementId
  title: Localized
  description: Localized
  hint: Localized
  icon: PixelIconName
  section?: SectionId
  secret?: boolean
}

export const META_ACHIEVEMENT_ID: AchievementId = 'curious_explorer'
export const STORAGE_KEY = 'portfolio-achievements-v1'

export const ACHIEVEMENTS: AchievementDef[] = [
  {
    id: 'overworld_chest',
    section: 'overworld',
    icon: 'chest',
    secret: true,
    title: { en: 'First Steps', id: 'Langkah Pertama' },
    description: {
      en: 'You found the hidden chest in the Overworld.',
      id: 'Kamu menemukan peti tersembunyi di Overworld.',
    },
    hint: {
      en: 'Something is tucked away among the flowers.',
      id: 'Ada sesuatu yang tersembunyi di antara bunga-bunga.',
    },
  },
  {
    id: 'cave_diamond',
    section: 'cave',
    icon: 'diamond',
    secret: true,
    title: { en: "Miner's Luck", id: 'Hoki Penambang' },
    description: {
      en: 'You spotted a diamond in the Cave.',
      id: 'Kamu menemukan diamond di Cave.',
    },
    hint: {
      en: 'A blue glint hides between stone and skill.',
      id: 'Kilau biru bersembunyi di antara batu dan keahlian.',
    },
  },
  {
    id: 'deepdark_sensor',
    section: 'deep-dark',
    icon: 'sculk',
    secret: true,
    title: { en: 'Deep Listener', id: 'Pendengar Dalam' },
    description: {
      en: 'You found the sculk sensor in the Deep Dark.',
      id: 'Kamu menemukan sculk sensor di Deep Dark.',
    },
    hint: {
      en: 'Listen closely in the dark. Something is watching.',
      id: 'Dengarkan baik-baik di kegelapan. Ada sesuatu yang mengawasi.',
    },
  },
  {
    id: 'nether_blaze',
    section: 'nether',
    icon: 'blaze',
    secret: true,
    title: { en: 'Hot Trail', id: 'Jejak Panas' },
    description: {
      en: 'You found blaze powder in the Nether.',
      id: 'Kamu menemukan blaze powder di Nether.',
    },
    hint: {
      en: 'The heat leaves a glowing trace.',
      id: 'Panasnya meninggalkan jejak bercahaya.',
    },
  },
  {
    id: 'end_pearl',
    section: 'the-end',
    icon: 'pearl',
    secret: true,
    title: { en: 'Pearl Hunter', id: 'Pemburu Pearl' },
    description: {
      en: 'You found an ender pearl near the void.',
      id: 'Kamu menemukan ender pearl di dekat kehampaan.',
    },
    hint: {
      en: 'An Enderman dropped something near the islands.',
      id: 'Seorang Enderman menjatuhkan sesuatu di dekat pulau-pulau.',
    },
  },
  {
    id: 'credits_star',
    section: 'credits',
    icon: 'star',
    secret: true,
    title: { en: 'Final Spark', id: 'Percikan Terakhir' },
    description: {
      en: 'You found a nether star in the credits.',
      id: 'Kamu menemukan nether star di credits.',
    },
    hint: {
      en: 'Even the credits hide a spark.',
      id: 'Bahkan credits menyimpan sebuah percikan.',
    },
  },
  {
    id: META_ACHIEVEMENT_ID,
    icon: 'trophy',
    secret: true,
    title: { en: 'Curious Explorer', id: 'Penjelajah Penasaran' },
    description: {
      en: 'You found every lost artifact.',
      id: 'Kamu menemukan semua artefak yang hilang.',
    },
    hint: {
      en: 'Find all six lost artifacts.',
      id: 'Temukan keenam artefak yang hilang.',
    },
  },
]

export const ARTIFACTS = ACHIEVEMENTS.filter(
  (achievement): achievement is AchievementDef & { section: SectionId } =>
    Boolean(achievement.section),
)

const VALID_IDS = new Set(ACHIEVEMENTS.map((achievement) => achievement.id))

export function isAchievementId(value: unknown): value is AchievementId {
  return typeof value === 'string' && VALID_IDS.has(value as AchievementId)
}

export function loadUnlocked(): Set<AchievementId> {
  if (typeof window === 'undefined') return new Set()
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY)
    if (!raw) return new Set()
    const parsed: unknown = JSON.parse(raw)
    if (!Array.isArray(parsed)) return new Set()
    return new Set(parsed.filter(isAchievementId))
  } catch {
    return new Set()
  }
}

export function saveUnlocked(unlocked: Set<AchievementId>) {
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(Array.from(unlocked)))
  } catch {
    // Private mode / storage disabled: the book still works for this session.
  }
}

export function artifactForSection(section: SectionId) {
  return ARTIFACTS.find((achievement) => achievement.section === section)
}
