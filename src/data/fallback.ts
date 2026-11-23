import type { SiteContent } from './types'

const uid = (n: string) => `fallback-${n}`

export const fallbackContent: SiteContent = {
  profile: {
    id: uid('profile'),
    name: { en: 'Alex', id: 'Alex' },
    role: { en: 'Full-stack Developer', id: 'Full-stack Developer' },
    tagline: {
      en: 'I build calm, durable interfaces — one block at a time.',
      id: 'Saya membangun antarmuka yang rapi dan tahan lama — satu blok demi satu blok.',
    },
    bio: {
      en: 'A developer who likes systems that are simple to read, fast to use, and pleasant to look at. Currently exploring web engineering, networking, and the occasional pixel.',
      id: 'Developer yang menyukai sistem yang mudah dibaca, cepat dipakai, dan enak dilihat. Sedang mendalami web engineering, networking, dan sesekali pixel.',
    },
    location: { en: 'Indonesia', id: 'Indonesia' },
    email: 'hello@example.com',
    avatar_url: null,
    resume_url: null,
  },
  projects: [
    {
      id: uid('p1'),
      slug: 'simkuliah',
      title: { en: 'SimKuliah', id: 'SimKuliah' },
      description: {
        en: 'A campus academic information system for schedules, grades, and course planning.',
        id: 'Sistem informasi akademik kampus untuk jadwal, nilai, dan perencanaan mata kuliah.',
      },
      tech: ['Laravel', 'MySQL', 'Tailwind'],
      image_url: null,
      demo_url: null,
      repo_url: null,
      year: '2025',
      featured: true,
      published: true,
      sort_order: 0,
    },
    {
      id: uid('p2'),
      slug: 'ipsec-web',
      title: { en: 'IPSec Dashboard', id: 'Dashboard IPSec' },
      description: {
        en: 'Monitoring and configuration panel for site-to-site IPSec tunnels.',
        id: 'Panel monitoring dan konfigurasi untuk tunnel IPSec site-to-site.',
      },
      tech: ['Node.js', 'Vue', 'Linux'],
      image_url: null,
      demo_url: null,
      repo_url: null,
      year: '2025',
      featured: false,
      published: true,
      sort_order: 1,
    },
    {
      id: uid('p3'),
      slug: 'cupid-music-player',
      title: { en: 'Cupid Music Player', id: 'Cupid Music Player' },
      description: {
        en: 'A small desktop music player with playlists, lyrics, and a soft visualizer.',
        id: 'Pemutar musik desktop kecil dengan playlist, lirik, dan visualizer yang lembut.',
      },
      tech: ['Electron', 'React', 'Web Audio'],
      image_url: null,
      demo_url: null,
      repo_url: null,
      year: '2024',
      featured: false,
      published: true,
      sort_order: 2,
    },
  ],
  achievements: [],
  skills: [
    { id: uid('s1'), name: 'TypeScript', tier: 'diamond', category: { en: 'Languages', id: 'Bahasa' }, sort_order: 0 },
    { id: uid('s2'), name: 'Python', tier: 'gold', category: { en: 'Languages', id: 'Bahasa' }, sort_order: 1 },
    { id: uid('s3'), name: 'React', tier: 'diamond', category: { en: 'Frontend', id: 'Frontend' }, sort_order: 2 },
    { id: uid('s4'), name: 'CSS', tier: 'gold', category: { en: 'Frontend', id: 'Frontend' }, sort_order: 3 },
    { id: uid('s5'), name: 'Node.js', tier: 'iron', category: { en: 'Backend', id: 'Backend' }, sort_order: 4 },
    { id: uid('s6'), name: 'PostgreSQL', tier: 'iron', category: { en: 'Backend', id: 'Backend' }, sort_order: 5 },
    { id: uid('s7'), name: 'Linux', tier: 'gold', category: { en: 'Tools', id: 'Perkakas' }, sort_order: 6 },
    { id: uid('s8'), name: 'Docker', tier: 'coal', category: { en: 'Tools', id: 'Perkakas' }, sort_order: 7 },
  ],
  experiences: [
    {
      id: uid('e1'),
      kind: 'education',
      company: 'University',
      role: { en: 'Computer Science', id: 'Ilmu Komputer' },
      period: '2022 — Present',
      description: {
        en: 'Focused on software engineering, computer networks, and distributed systems.',
        id: 'Fokus pada rekayasa perangkat lunak, jaringan komputer, dan sistem terdistribusi.',
      },
      logo_url: null,
      sort_order: 0,
    },
    {
      id: uid('e2'),
      kind: 'organization',
      company: 'Student Association',
      role: { en: 'Technology Division', id: 'Divisi Teknologi' },
      period: '2023 — 2024',
      description: {
        en: 'Built internal tools and organized workshops for new members.',
        id: 'Membangun tools internal dan mengadakan workshop untuk anggota baru.',
      },
      logo_url: null,
      sort_order: 1,
    },
    {
      id: uid('e3'),
      kind: 'work',
      company: 'Freelance',
      role: { en: 'Web Developer', id: 'Web Developer' },
      period: '2023 — Present',
      description: {
        en: 'Delivered small business websites and internal dashboards.',
        id: 'Mengerjakan website usaha kecil dan dashboard internal.',
      },
      logo_url: null,
      sort_order: 2,
    },
  ],
  socials: [
    { id: uid('so1'), platform: 'GitHub', url: 'https://github.com/', label: '@github', icon: 'github', sort_order: 0 },
    { id: uid('so2'), platform: 'LinkedIn', url: 'https://linkedin.com/', label: 'in/you', icon: 'linkedin', sort_order: 1 },
    { id: uid('so3'), platform: 'Email', url: 'mailto:hello@example.com', label: 'hello@example.com', icon: 'mail', sort_order: 2 },
    { id: uid('so4'), platform: 'Instagram', url: 'https://instagram.com/', label: '@you', icon: 'instagram', sort_order: 3 },
  ],
  settings: {
    credits: {
      en: 'Thanks for walking through the world.\nEvery biome here was built with care — and a little redstone.',
      id: 'Terima kasih sudah berjalan menyusuri dunia ini.\nSetiap biome dibangun dengan hati — dan sedikit redstone.',
    },
    seo_title: {
      en: 'Portfolio — A Minecraft Journey',
      id: 'Portofolio — Perjalanan Minecraft',
    },
    seo_description: {
      en: 'Personal portfolio presented as a journey through Minecraft biomes.',
      id: 'Portofolio pribadi yang disajikan sebagai perjalanan melalui biome Minecraft.',
    },
  },
}
