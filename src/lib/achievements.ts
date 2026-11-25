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
  | 'fishing_first'
  | 'fishing_25'
  | 'fishing_rods'
  | 'fishing_collection'
  | 'fishing_echo'
  | 'rift_first'
  | 'rift_collector'
  | 'brew_first'
  | 'brew_perfect'
  | 'brew_master'
  | 'brew_recipes'
  | 'brew_collection'
  | 'brew_clean'

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
  {
    "id": "fishing_first",
    "icon": "chest",
    "title": {
      "en": "First Catch",
      "id": "Tangkapan Pertama"
    },
    "description": {
      "en": "Catch your first fish.",
      "id": "Dapatkan tangkapan ikan pertama."
    },
    "hint": {
      "en": "Catch your first fish.",
      "id": "Dapatkan tangkapan ikan pertama."
    }
  },
  {
    "id": "fishing_25",
    "icon": "trophy",
    "title": {
      "en": "Patient Angler",
      "id": "Pemancing Tekun"
    },
    "description": {
      "en": "Catch 25 fish.",
      "id": "Tangkap 25 ikan."
    },
    "hint": {
      "en": "Catch 25 fish.",
      "id": "Tangkap 25 ikan."
    }
  },
  {
    "id": "fishing_rods",
    "icon": "diamond",
    "title": {
      "en": "Rod Collector",
      "id": "Kolektor Pancing"
    },
    "description": {
      "en": "Unlock all 5 fishing rods.",
      "id": "Buka semua 5 pancing."
    },
    "hint": {
      "en": "Unlock all 5 fishing rods.",
      "id": "Buka semua 5 pancing."
    }
  },
  {
    "id": "fishing_collection",
    "icon": "book",
    "title": {
      "en": "Full Collection",
      "id": "Koleksi Lengkap"
    },
    "description": {
      "en": "Discover all 12 regular catches. The secret fish is a separate challenge.",
      "id": "Temukan 12 tangkapan biasa. Ikan rahasia punya tantangan tersendiri."
    },
    "hint": {
      "en": "Discover all 12 regular catches. The secret fish is a separate challenge.",
      "id": "Temukan 12 tangkapan biasa. Ikan rahasia punya tantangan tersendiri."
    }
  },
  {
    "id": "fishing_echo",
    "icon": "sculk",
    "title": {
      "en": "Echo from Below",
      "id": "Gema dari Kedalaman"
    },
    "description": {
      "en": "Catch the secret Echo Fish using an Echo Shard.",
      "id": "Tangkap Ikan Gema dengan Echo Shard."
    },
    "hint": {
      "en": "Catch the secret Echo Fish using an Echo Shard.",
      "id": "Tangkap Ikan Gema dengan Echo Shard."
    },
    "secret": true
  },
  {
    "id": "rift_first",
    "icon": "blaze",
    "title": {
      "en": "Through the Rift",
      "id": "Dari Celah Nether"
    },
    "description": {
      "en": "Reel in a Nether material.",
      "id": "Pancing satu bahan Nether."
    },
    "hint": {
      "en": "Reel in a Nether material.",
      "id": "Pancing satu bahan Nether."
    }
  },
  {
    "id": "rift_collector",
    "icon": "chest",
    "title": {
      "en": "Well Stocked",
      "id": "Bahan Lengkap"
    },
    "description": {
      "en": "Find all 6 material types. Used materials still count.",
      "id": "Temukan 6 jenis bahan. Bahan yang sudah dipakai tetap dihitung."
    },
    "hint": {
      "en": "Find all 6 material types. Used materials still count.",
      "id": "Temukan 6 jenis bahan. Bahan yang sudah dipakai tetap dihitung."
    }
  },
  {
    "id": "brew_first",
    "icon": "blaze",
    "title": {
      "en": "First Brew",
      "id": "Racikan Pertama"
    },
    "description": {
      "en": "Finish a brew with Good quality or better.",
      "id": "Selesaikan racikan dengan kualitas Bagus atau lebih."
    },
    "hint": {
      "en": "Finish a brew with Good quality or better.",
      "id": "Selesaikan racikan dengan kualitas Bagus atau lebih."
    }
  },
  {
    "id": "brew_perfect",
    "icon": "star",
    "title": {
      "en": "Just Right",
      "id": "Pas Banget"
    },
    "description": {
      "en": "Make your first Perfect brew.",
      "id": "Buat racikan Sempurna pertama."
    },
    "hint": {
      "en": "Make your first Perfect brew.",
      "id": "Buat racikan Sempurna pertama."
    }
  },
  {
    "id": "brew_master",
    "icon": "trophy",
    "title": {
      "en": "Brewmaster",
      "id": "Brewmaster"
    },
    "description": {
      "en": "Make 5 Perfect brews. Unlock the Soul Flame cosmetic.",
      "id": "Buat 5 racikan Sempurna. Buka kosmetik Api Jiwa."
    },
    "hint": {
      "en": "Make 5 Perfect brews. Unlock the Soul Flame cosmetic.",
      "id": "Buat 5 racikan Sempurna. Buka kosmetik Api Jiwa."
    }
  },
  {
    "id": "brew_recipes",
    "icon": "book",
    "title": {
      "en": "Recipe Collector",
      "id": "Kolektor Resep"
    },
    "description": {
      "en": "Unlock all 4 recipes by completing 5 brews.",
      "id": "Buka 4 resep dengan menyelesaikan 5 racikan."
    },
    "hint": {
      "en": "Unlock all 4 recipes by completing 5 brews.",
      "id": "Buka 4 resep dengan menyelesaikan 5 racikan."
    }
  },
  {
    "id": "brew_collection",
    "icon": "diamond",
    "title": {
      "en": "A Full Shelf",
      "id": "Rak Ramuan Lengkap"
    },
    "description": {
      "en": "Brew all 4 recipes with Good quality or better.",
      "id": "Racik 4 resep dengan kualitas Bagus atau lebih."
    },
    "hint": {
      "en": "Brew all 4 recipes with Good quality or better.",
      "id": "Racik 4 resep dengan kualitas Bagus atau lebih."
    }
  },
  {
    "id": "brew_clean",
    "icon": "pearl",
    "title": {
      "en": "Not a Drop Spilled",
      "id": "Tanpa Tumpah"
    },
    "description": {
      "en": "Hit all 9 doses without overheating.",
      "id": "Tepatkan 9 takaran tanpa terlalu panas."
    },
    "hint": {
      "en": "Hit all 9 doses without overheating.",
      "id": "Tepatkan 9 takaran tanpa terlalu panas."
    }
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
