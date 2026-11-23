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

  view_projects: 'View projects',
  contact_me: 'Contact me',
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

  view_projects: 'Lihat proyek',
  contact_me: 'Hubungi saya',
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
