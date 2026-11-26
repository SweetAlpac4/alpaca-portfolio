import { contentUrl } from '../lib/contentUrl'
import { useQuery } from '@tanstack/react-query'
import { supabase } from '../lib/supabase'
import { fallbackContent } from './fallback'
import {
  loc,
  type Achievement,
  type Experience,
  type ExperienceKind,
  type Localized,
  type Profile,
  type Project,
  type Settings,
  type SiteContent,
  type Skill,
  type SkillTier,
  type Social,
} from './types'

type Row = Record<string, unknown>

const str = (v: unknown, fallback = ''): string =>
  typeof v === 'string' ? v : fallback

const bool = (v: unknown, fallback = false): boolean =>
  typeof v === 'boolean' ? v : fallback

const num = (v: unknown, fallback = 0): number =>
  typeof v === 'number' ? v : Number(v) || fallback

const arr = (v: unknown): string[] =>
  Array.isArray(v) ? v.filter((x): x is string => typeof x === 'string') : []

const TIERS: SkillTier[] = ['coal', 'iron', 'gold', 'diamond', 'netherite']
const KINDS: ExperienceKind[] = ['education', 'organization', 'work']

function toProfile(row: Row): Profile {
  return {
    id: str(row.id),
    name: loc(row.name),
    role: loc(row.role),
    tagline: loc(row.tagline),
    bio: loc(row.bio),
    location: loc(row.location),
    email: str(row.email),
    avatar_url: contentUrl(row.avatar_url),
    resume_url: contentUrl(row.resume_url),
  }
}

function toProject(row: Row): Project {
  return {
    id: str(row.id),
    slug: (row.slug as string | null) ?? null,
    title: loc(row.title),
    description: loc(row.description),
    tech: arr(row.tech),
    image_url: contentUrl(row.image_url),
    demo_url: contentUrl(row.demo_url),
    repo_url: contentUrl(row.repo_url),
    year: (row.year as string | null) ?? null,
    featured: bool(row.featured),
    published: bool(row.published, true),
    sort_order: num(row.sort_order),
  }
}

function toAchievement(row: Row): Achievement {
  return {
    id: str(row.id),
    title: loc(row.title),
    issuer: str(row.issuer),
    description: loc(row.description),
    year: (row.year as string | null) ?? null,
    certificate_url: contentUrl(row.certificate_url),
    link_url: contentUrl(row.link_url),
    published: bool(row.published, true),
    sort_order: num(row.sort_order),
  }
}

function toSkill(row: Row): Skill {
  const tier = str(row.tier, 'coal') as SkillTier
  return {
    id: str(row.id),
    name: str(row.name),
    tier: TIERS.includes(tier) ? tier : 'coal',
    category: loc(row.category),
    sort_order: num(row.sort_order),
  }
}

function toExperience(row: Row): Experience {
  const kind = str(row.kind, 'work') as ExperienceKind
  return {
    id: str(row.id),
    kind: KINDS.includes(kind) ? kind : 'work',
    company: str(row.company),
    role: loc(row.role),
    period: str(row.period),
    description: loc(row.description),
    logo_url: contentUrl(row.logo_url),
    sort_order: num(row.sort_order),
  }
}

function toSocial(row: Row): Social {
  return {
    id: str(row.id),
    platform: str(row.platform),
    url: contentUrl(row.url, true) ?? '',
    label: str(row.label),
    icon: str(row.icon, 'link'),
    sort_order: num(row.sort_order),
  }
}

function toSettings(rows: Row[]): Settings {
  const map = new Map<string, unknown>()
  for (const row of rows) map.set(str(row.key), row.value)
  const credits = loc(map.get('credits'))
  const seoTitle = loc(map.get('seo_title'))
  const seoDescription = loc(map.get('seo_description'))
  return {
    credits: credits.en || credits.id ? credits : fallbackContent.settings.credits,
    seo_title:
      seoTitle.en || seoTitle.id ? seoTitle : fallbackContent.settings.seo_title,
    seo_description:
      seoDescription.en || seoDescription.id
        ? seoDescription
        : fallbackContent.settings.seo_description,
  }
}

async function fetchSection<T>(
  label: string,
  promise: PromiseLike<{ data: T[] | null; error: unknown }>,
): Promise<T[] | null> {
  try {
    const { data, error } = await promise
    if (error) throw error
    return data ?? []
  } catch (error) {
    console.warn(`[content] ${label} unavailable, using fallback.`, error)
    return null
  }
}

export async function fetchContent(): Promise<SiteContent> {
  if (!supabase) return fallbackContent

  const [
    profileRows,
    projectRows,
    achievementRows,
    skillRows,
    experienceRows,
    socialRows,
    settingRows,
  ] = await Promise.all([
    fetchSection<Row>(
      'profile',
      supabase.from('profile').select('*').limit(1),
    ),
    fetchSection<Row>(
      'projects',
      supabase
        .from('projects')
        .select('*')
        .eq('published', true)
        .order('sort_order', { ascending: true }),
    ),
    fetchSection<Row>(
      'achievements',
      supabase
        .from('achievements')
        .select('*')
        .eq('published', true)
        .order('sort_order', { ascending: true }),
    ),
    fetchSection<Row>(
      'skills',
      supabase.from('skills').select('*').order('sort_order', { ascending: true }),
    ),
    fetchSection<Row>(
      'experiences',
      supabase
        .from('experiences')
        .select('*')
        .order('sort_order', { ascending: true }),
    ),
    fetchSection<Row>(
      'socials',
      supabase.from('socials').select('*').order('sort_order', { ascending: true }),
    ),
    fetchSection<Row>('settings', supabase.from('settings').select('key,value').in('key', ['credits', 'seo_title', 'seo_description'])),
  ])

  const profile =
    profileRows && profileRows.length > 0
      ? toProfile(profileRows[0])
      : fallbackContent.profile

  const projects = projectRows
    ? projectRows.map(toProject)
    : fallbackContent.projects

  const achievements = achievementRows
    ? achievementRows.map(toAchievement)
    : fallbackContent.achievements

  const skills = skillRows ? skillRows.map(toSkill) : fallbackContent.skills

  const experiences = experienceRows
    ? experienceRows.map(toExperience)
    : fallbackContent.experiences

  const socials = socialRows ? socialRows.map(toSocial).filter(social => social.url) : fallbackContent.socials

  const settings =
    settingRows && settingRows.length > 0
      ? toSettings(settingRows)
      : fallbackContent.settings

  return {
    profile,
    projects,
    achievements,
    skills,
    experiences,
    socials,
    settings,
  }
}

export function useContent() {
  return useQuery({
    queryKey: ['site-content'],
    queryFn: fetchContent,
    staleTime: 1000 * 60 * 5,
    retry: 0,
  })
}

export type { Localized }
