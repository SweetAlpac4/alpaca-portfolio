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
  | 'cave_first_ore'
  | 'cave_100'
  | 'cave_all_ores'
  | 'cave_pickaxe'
  | 'cave_find_diamond'
  | 'cave_combo'
  | 'cave_clean'
  | 'cave_geologist'

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
      "en": "Unlock all 6 fishing rods.",
      "id": "Buka semua 6 pancing."
    },
    "hint": {
      "en": "Unlock all 6 fishing rods.",
      "id": "Buka semua 6 pancing."
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
      "en": "Catch the secret Echo Fish with the Warden Rod.",
      "id": "Tangkap Ikan Gema dengan Warden Rod."
    },
    "hint": {
      "en": "Catch the secret Echo Fish with the Warden Rod.",
      "id": "Tangkap Ikan Gema dengan Warden Rod."
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
      "en": "Unlock all 5 recipes by completing 8 brews.",
      "id": "Buka 5 resep dengan menyelesaikan 8 racikan."
    },
    "hint": {
      "en": "Unlock all 5 recipes by completing 8 brews.",
      "id": "Buka 5 resep dengan menyelesaikan 8 racikan."
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
      "en": "Brew all 5 recipes with Good quality or better.",
      "id": "Racik 5 resep dengan kualitas Bagus atau lebih."
    },
    "hint": {
      "en": "Brew all 5 recipes with Good quality or better.",
      "id": "Racik 5 resep dengan kualitas Bagus atau lebih."
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
  {
    id: 'cave_first_ore', icon: 'diamond',
    title: { en: 'First Strikes', id: 'Pukulan Pertama' },
    description: { en: 'Mine your first ore.', id: 'Tambang bijih pertamamu.' },
    hint: { en: 'Mine your first ore.', id: 'Tambang bijih pertamamu.' },
  },
  {
    id: 'cave_100', icon: 'trophy',
    title: { en: 'Ore Hoarder', id: 'Penimbun Bijih' },
    description: { en: 'Mine 100 ores over time.', id: 'Tambang 100 bijih sepanjang permainan.' },
    hint: { en: 'Mine 100 ores over time.', id: 'Tambang 100 bijih sepanjang permainan.' },
  },
  {
    id: 'cave_all_ores', icon: 'chest',
    title: { en: 'Full Cart', id: 'Gerobak Penuh' },
    description: { en: 'Discover all 7 cave ores.', id: 'Temukan ketujuh jenis bijih Cave.' },
    hint: { en: 'Discover all 7 cave ores.', id: 'Temukan ketujuh jenis bijih Cave.' },
  },
  {
    id: 'cave_pickaxe', icon: 'diamond',
    title: { en: 'Fully Upgraded', id: 'Puncak Peralatan' },
    description: { en: 'Own the diamond pickaxe.', id: 'Miliki beliung diamond.' },
    hint: { en: 'Own the diamond pickaxe.', id: 'Miliki beliung diamond.' },
  },
  {
    id: 'cave_find_diamond', icon: 'diamond',
    title: { en: 'Diamond in the Rough', id: 'Berlian Kasar' },
    description: { en: 'Find a diamond while mining.', id: 'Temukan diamond saat menambang.' },
    hint: { en: 'Find a diamond while mining.', id: 'Temukan diamond saat menambang.' },
  },
  {
    id: 'cave_combo', icon: 'blaze',
    title: { en: 'Chain Reaction', id: 'Rantai Tambang' },
    description: { en: 'Reach a combo of 8 in one run.', id: 'Raih kombo 8 dalam satu sesi.' },
    hint: { en: 'Reach a combo of 8 in one run.', id: 'Raih kombo 8 dalam satu sesi.' },
  },
  {
    id: 'cave_clean', icon: 'pearl',
    title: { en: 'No Lava, No Problem', id: 'Aman Tanpa Lava' },
    description: { en: 'Finish one run without hitting lava.', id: 'Selesaikan satu sesi tanpa terkena lava.' },
    hint: { en: 'Finish one run without hitting lava.', id: 'Selesaikan satu sesi tanpa terkena lava.' },
  },
  {
    id: 'cave_geologist', icon: 'sculk',
    title: { en: 'Deep Geologist', id: 'Geolog Dalam' },
    description: { en: 'Mine both quartz and glowstone.', id: 'Tambang kuarsa dan glowstone.' },
    hint: { en: 'Mine both quartz and glowstone.', id: 'Tambang kuarsa dan glowstone.' },
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
