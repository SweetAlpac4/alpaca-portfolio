import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react'
import type { Lang, Localized } from '../data/types'

const en = {
  nav_overworld: 'Overworld',
  nav_cave: 'Cave',
  nav_deepdark: 'Deep Dark',
  nav_nether: 'Nether',
  nav_end: 'The End',
  nav_credits: 'Credits',

  loading_world: 'Loading world',
  loading_terrain: 'Building terrain',
  loading_entities: 'Loading entities',
  loading_spawn: 'Preparing spawn area',
  loading_done: 'Done',
  click_to_play: 'Click to Play',
  loading_tip_1: 'Press F3 to toggle the debug screen',
  loading_tip_2: 'Every biome hides something worth finding',
  loading_tip_3: 'Scroll down to travel deeper',
  loading_tip_4: 'Use the hotbar to jump between biomes',
  loading_tip_5: 'Press E to open the advancement book',

  view_projects: 'View projects',
  contact_me: 'Contact me',
  open_cv: 'Open CV',
  scroll_hint: 'Scroll to explore',
  about_me: 'About me',
  education: 'Education',
  skills: 'Skills',
  cave_sub: 'Cave — where knowledge is mined, one ore at a time.',
  deepdark_sub:
    'Deep below the surface, each chest holds something built with care.',
  nether_sub:
    'Forged in the heat — teams, roles, and things shipped under pressure.',
  projects: 'Projects',
  achievements: 'Achievements',
  certificate: 'Certificate',
  view_certificate: 'View certificate',
  experience: 'Experience',
  organizations: 'Organizations',
  contact: 'Contact',
  lets_talk: "Let's build something",
  contact_blurb:
    'Have a project, a question, or just want to say hello? The portal is open.',
  send_email: 'Send an email',
  find_me: 'Find me',
  live_demo: 'Live demo',
  source_code: 'Source code',
  empty_projects: 'No projects yet. The chest is empty.',
  empty_achievements: 'No achievements yet. The display case is empty.',
  empty_skills: 'No skills added yet.',
  empty_experience: 'Nothing here yet.',
  tier_coal: 'Learning',
  tier_iron: 'Familiar',
  tier_gold: 'Comfortable',
  tier_diamond: 'Advanced',
  tier_netherite: 'Expert',
  advancement: 'Advancement Made!',
  achievement_book: 'Advancement Book',
  achievement_book_sub: 'Find the lost artifacts hidden across the biomes.',
  lost_artifacts: 'Lost Artifacts',
  artifacts_found: 'Artifacts found',
  found: 'Found',
  locked: 'Locked',
  hint: 'Hint',
  reset_progress: 'Reset progress',
  reset_confirm: 'Click again to confirm',
  progress_saved_locally: 'Progress is saved in this browser. No account needed.',
  all_artifacts: 'Every lost artifact has been found.',
  all_artifacts_sub: 'The world remembers. Check the credits.',
  hidden_item: 'Something glimmers here',
  secret_ending_label: 'Secret ending',
  secret_ending: 'You found every lost artifact. The world remembers.',

  fishing: 'Fishing',
  fishing_sub: 'Cast, wait for a bite, and reel in your catch.',
  fishing_help:
    'Cast. Wait for the !. Then hold to reel and release before the line snaps.',
  fishing_rod: 'Fishing Rod',
  cast: 'Cast',
  casting: 'Casting...',
  waiting_bite: 'Waiting for a bite...',
  bite: 'Bite! Reel!',
  reel: 'Reel!',
  reeling: 'Reeling...',
  hold_to_reel: 'Hold to reel',
  release_to_slack: 'Release to lower tension',
  cast_again: 'Cast again',
  caught: 'Caught!',
  perfect: 'Perfect reel!',
  escaped: 'It got away...',
  line_snapped: 'The line snapped!',
  tension: 'Tension',
  catch_progress: 'Catch',
  weight: 'Weight',
  length: 'Length',
  size: 'Size',
  rarity: 'Rarity',
  rarity_common: 'Common',
  rarity_uncommon: 'Uncommon',
  rarity_rare: 'Rare',
  rarity_legendary: 'Legendary',
  rarity_mythic: 'Mythic',
  size_tiny: 'Tiny',
  size_small: 'Small',
  size_average: 'Average',
  size_large: 'Large',
  size_trophy: 'Trophy',
  chest: 'Chest',
  chest_capacity: 'Capacity',
  chest_full: 'Chest is full. Release a fish first.',
  chest_empty: 'Chest is empty. Catch something first.',
  release: 'Release',
  release_confirm: 'Click again to release',
  sort_newest: 'Newest',
  sort_heaviest: 'Heaviest',
  journal: 'Journal',
  journal_sub: 'Every catch, and every species still hiding.',
  species_found: 'Species found',
  caught_on: 'Caught',
  rods: 'Rods',
  rods_sub: 'Unlock stronger rods by catching and discovering.',
  selected_rod: 'Rod',
  equip: 'Equip',
  equipped: 'Equipped',
  unlock_at: 'Unlock at',
  catches: 'Catches',
  casts: 'Casts',
  escapes: 'Escapes',
  best_streak: 'Perfect streak',
  total_weight: 'Total weight',
  fishing_stats: 'Fishing stats',
  fishing_saved_locally: 'Fishing progress is saved in this browser.',
  new_rod_unlocked: 'New rod unlocked',
  reset_fishing: 'Reset fishing progress',
  reset_fishing_confirm: 'Click again to reset fishing',
  secret_fish_hint:
    'Only bites for those who carry something from the Deep Dark.',
  secret_requires: 'Requires Echo Shard from the Deep Dark.',
  unknown: '???',
  fishing_locked_hint:
    'Keep casting — every cast can bring something new.',
  bite_window: 'Bite window',
  tension_control: 'Tension control',
  luck: 'Luck',
  entering: 'Entering',
  debug_screen: 'Debug screen',
  music: 'Music',
  mute: 'Mute',
  unmute: 'Unmute',
  volume: 'Volume',
  back_to_top: 'Respawn',
  previous_page: 'Previous page',
  next_page: 'Next page',
  scroll_sideways: 'Scroll',
  credits_heading: 'Minecraft Credits',
  credits_thanks: 'Thank you for playing',
  credits_built_with: 'Built with',
  credits_music: 'Music',
  credits_note: 'Personal, non-commercial project. Minecraft is a trademark of Mojang Studios.',
  loading_edition: 'Portfolio Edition',
  lang_label: 'Language',
  admin: 'Admin',
  menu: 'Menu',
  close: 'Close',
}

const id: Record<keyof typeof en, string> = {
  nav_overworld: 'Overworld',
  nav_cave: 'Cave',
  nav_deepdark: 'Deep Dark',
  nav_nether: 'Nether',
  nav_end: 'The End',
  nav_credits: 'Credits',

  loading_world: 'Memuat dunia',
  loading_terrain: 'Membangun terrain',
  loading_entities: 'Memuat entitas',
  loading_spawn: 'Menyiapkan area spawn',
  loading_done: 'Selesai',
  click_to_play: 'Klik untuk Main',
  loading_tip_1: 'Tekan F3 untuk membuka layar debug',
  loading_tip_2: 'Setiap biome menyimpan sesuatu yang layak ditemukan',
  loading_tip_3: 'Gulir ke bawah untuk turun lebih dalam',
  loading_tip_4: 'Pakai hotbar untuk melompat antar biome',
  loading_tip_5: 'Tekan E untuk membuka buku advancement',

  view_projects: 'Lihat proyek',
  contact_me: 'Hubungi saya',
  open_cv: 'Buka CV',
  scroll_hint: 'Gulir untuk menjelajah',
  about_me: 'Tentang saya',
  education: 'Pendidikan',
  skills: 'Keahlian',
  cave_sub: 'Cave — tempat ilmu ditambang, satu bijih demi satu bijih.',
  deepdark_sub:
    'Jauh di bawah permukaan, setiap peti menyimpan sesuatu yang dibangun dengan hati-hati.',
  nether_sub:
    'Ditempa dalam panas — tim, peran, dan hal-hal yang diselesaikan di bawah tekanan.',
  projects: 'Proyek',
  achievements: 'Pencapaian',
  certificate: 'Sertifikat',
  view_certificate: 'Lihat sertifikat',
  experience: 'Pengalaman',
  organizations: 'Organisasi',
  contact: 'Kontak',
  lets_talk: 'Mari membangun sesuatu',
  contact_blurb:
    'Punya proyek, pertanyaan, atau sekadar ingin menyapa? Portalnya terbuka.',
  send_email: 'Kirim email',
  find_me: 'Temukan saya',
  live_demo: 'Demo langsung',
  source_code: 'Kode sumber',
  empty_projects: 'Belum ada proyek. Petinya masih kosong.',
  empty_achievements: 'Belum ada pencapaian. Etalase masih kosong.',
  empty_skills: 'Belum ada keahlian.',
  empty_experience: 'Belum ada isi.',
  tier_coal: 'Belajar',
  tier_iron: 'Kenal',
  tier_gold: 'Nyaman',
  tier_diamond: 'Mahir',
  tier_netherite: 'Ahli',
  advancement: 'Advancement Made!',
  achievement_book: 'Buku Advancement',
  achievement_book_sub: 'Temukan artefak yang hilang di setiap biome.',
  lost_artifacts: 'Artefak Hilang',
  artifacts_found: 'Artefak ditemukan',
  found: 'Ditemukan',
  locked: 'Terkunci',
  hint: 'Petunjuk',
  reset_progress: 'Reset progres',
  reset_confirm: 'Klik lagi untuk konfirmasi',
  progress_saved_locally: 'Progres tersimpan di browser ini. Tanpa akun.',
  all_artifacts: 'Semua artefak yang hilang telah ditemukan.',
  all_artifacts_sub: 'Dunia mengingatnya. Cek credits.',
  hidden_item: 'Ada sesuatu yang berkilau di sini',
  secret_ending_label: 'Ending rahasia',
  secret_ending: 'Kamu menemukan semua artefak yang hilang. Dunia mengingatnya.',

  fishing: 'Mancing',
  fishing_sub: 'Lempar pancing, tunggu gigitan, lalu tarik tangkapanmu.',
  fishing_help:
    'Lempar. Tunggu tanda !. Lalu tahan untuk menarik dan lepas sebelum senar putus.',
  fishing_rod: 'Pancing',
  cast: 'Lempar',
  casting: 'Melempar...',
  waiting_bite: 'Menunggu gigitan...',
  bite: 'Gigitan! Tarik!',
  reel: 'Tarik!',
  reeling: 'Menarik...',
  hold_to_reel: 'Tahan untuk menarik',
  release_to_slack: 'Lepas untuk menurunkan ketegangan',
  cast_again: 'Lempar lagi',
  caught: 'Dapat!',
  perfect: 'Tarik sempurna!',
  escaped: 'Ikan kabur...',
  line_snapped: 'Senar putus!',
  tension: 'Ketegangan',
  catch_progress: 'Tangkapan',
  weight: 'Berat',
  length: 'Panjang',
  size: 'Ukuran',
  rarity: 'Kelangkaan',
  rarity_common: 'Umum',
  rarity_uncommon: 'Tidak Umum',
  rarity_rare: 'Langka',
  rarity_legendary: 'Legendaris',
  rarity_mythic: 'Mitos',
  size_tiny: 'Mungil',
  size_small: 'Kecil',
  size_average: 'Sedang',
  size_large: 'Besar',
  size_trophy: 'Trofi',
  chest: 'Peti',
  chest_capacity: 'Kapasitas',
  chest_full: 'Peti penuh. Lepaskan ikan dulu.',
  chest_empty: 'Peti kosong. Tangkap sesuatu dulu.',
  release: 'Lepaskan',
  release_confirm: 'Klik lagi untuk melepas',
  sort_newest: 'Terbaru',
  sort_heaviest: 'Terberat',
  journal: 'Jurnal',
  journal_sub: 'Semua tangkapan, dan semua spesies yang masih tersembunyi.',
  species_found: 'Spesies ditemukan',
  caught_on: 'Ditangkap',
  rods: 'Pancing',
  rods_sub: 'Buka pancing lebih kuat dengan menangkap dan menemukan spesies.',
  selected_rod: 'Pancing',
  equip: 'Pakai',
  equipped: 'Dipakai',
  unlock_at: 'Terbuka di',
  catches: 'Tangkapan',
  casts: 'Lemparan',
  escapes: 'Kabur',
  best_streak: 'Streak sempurna',
  total_weight: 'Total berat',
  fishing_stats: 'Statistik mancing',
  fishing_saved_locally: 'Progres mancing tersimpan di browser ini.',
  new_rod_unlocked: 'Pancing baru terbuka',
  reset_fishing: 'Reset progres mancing',
  reset_fishing_confirm: 'Klik lagi untuk reset mancing',
  secret_fish_hint:
    'Hanya menggigit bagi yang membawa sesuatu dari Deep Dark.',
  secret_requires: 'Butuh Echo Shard dari Deep Dark.',
  unknown: '???',
  fishing_locked_hint:
    'Terus lempar — setiap lemparan bisa membawa sesuatu yang baru.',
  bite_window: 'Window gigitan',
  tension_control: 'Kontrol ketegangan',
  luck: 'Keberuntungan',
  entering: 'Memasuki',
  debug_screen: 'Layar debug',
  music: 'Musik',
  mute: 'Bisukan',
  unmute: 'Nyalakan',
  volume: 'Volume',
  back_to_top: 'Respawn',
  previous_page: 'Halaman sebelumnya',
  next_page: 'Halaman berikutnya',
  scroll_sideways: 'Geser',
  credits_heading: 'Minecraft Credits',
  credits_thanks: 'Terima kasih sudah bermain',
  credits_built_with: 'Dibangun dengan',
  credits_music: 'Musik',
  credits_note:
    'Proyek pribadi dan non-komersial. Minecraft adalah merek dagang Mojang Studios.',
  loading_edition: 'Portfolio Edition',
  lang_label: 'Bahasa',
  admin: 'Admin',
  menu: 'Menu',
  close: 'Tutup',
}

export type TranslationKey = keyof typeof en

export const dictionaries = { en, id }

type LanguageContextValue = {
  lang: Lang
  setLang: (lang: Lang) => void
  toggleLang: () => void
  t: (key: TranslationKey) => string
  pick: (value: Localized | null | undefined) => string
}

const LanguageContext = createContext<LanguageContextValue | null>(null)

function detectLang(): Lang {
  const stored = localStorage.getItem('portfolio-lang')
  if (stored === 'en' || stored === 'id') return stored
  const browser = navigator.language.toLowerCase()
  return browser.startsWith('id') ? 'id' : 'en'
}

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [lang, setLangState] = useState<Lang>(() => {
    try {
      return detectLang()
    } catch {
      return 'en'
    }
  })

  useEffect(() => {
    document.documentElement.lang = lang
    try {
      localStorage.setItem('portfolio-lang', lang)
    } catch {
      /* ignore */
    }
  }, [lang])

  const setLang = useCallback((next: Lang) => setLangState(next), [])
  const toggleLang = useCallback(
    () => setLangState((current) => (current === 'en' ? 'id' : 'en')),
    [],
  )
  const t = useCallback((key: TranslationKey) => dictionaries[lang][key], [lang])
  const pick = useCallback(
    (value: Localized | null | undefined) => {
      if (!value) return ''
      return value[lang] || value.en || value.id || ''
    },
    [lang],
  )

  const value = useMemo(
    () => ({ lang, setLang, toggleLang, t, pick }),
    [lang, setLang, toggleLang, t, pick],
  )

  return <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>
}

export function useLang(): LanguageContextValue {
  const context = useContext(LanguageContext)
  if (!context) throw new Error('useLang must be used inside LanguageProvider')
  return context
}
