export type Lang = 'en' | 'id'

export type Localized = { en: string; id: string }

export type SkillTier = 'coal' | 'iron' | 'gold' | 'diamond' | 'netherite'

export type ExperienceKind = 'education' | 'organization' | 'work'

export interface Profile {
  id: string
  name: Localized
  role: Localized
  tagline: Localized
  bio: Localized
  location: Localized
  email: string
  avatar_url: string | null
  resume_url: string | null
}

export interface Project {
  id: string
  slug: string | null
  title: Localized
  description: Localized
  tech: string[]
  image_url: string | null
  demo_url: string | null
  repo_url: string | null
  year: string | null
  featured: boolean
  published: boolean
  sort_order: number
}

export interface Achievement {
  id: string
  title: Localized
  issuer: string
  description: Localized
  year: string | null
  certificate_url: string | null
  link_url: string | null
  published: boolean
  sort_order: number
}

export interface Skill {
  id: string
  name: string
  tier: SkillTier
  category: Localized
  sort_order: number
}

export interface Experience {
  id: string
  kind: ExperienceKind
  company: string
  role: Localized
  period: string
  description: Localized
  logo_url: string | null
  sort_order: number
}

export interface Social {
  id: string
  platform: string
  url: string
  label: string
  icon: string
  sort_order: number
}

export interface Settings {
  credits: Localized
  seo_title: Localized
  seo_description: Localized
}

export interface SiteContent {
  profile: Profile
  projects: Project[]
  achievements: Achievement[]
  skills: Skill[]
  experiences: Experience[]
  socials: Social[]
  settings: Settings
}

export const emptyLocalized: Localized = { en: '', id: '' }

export function loc(value: unknown): Localized {
  if (!value || typeof value !== 'object') return { ...emptyLocalized }
  const v = value as Record<string, unknown>
  return {
    en: typeof v.en === 'string' ? v.en : '',
    id: typeof v.id === 'string' ? v.id : '',
  }
}
