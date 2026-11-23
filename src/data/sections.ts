import type { TranslationKey } from '../i18n'

export type SectionId =
  | 'overworld'
  | 'cave'
  | 'deep-dark'
  | 'nether'
  | 'the-end'
  | 'credits'

export type SectionMeta = {
  id: SectionId
  labelKey: TranslationKey
  texture: string
}

export const SECTIONS: SectionMeta[] = [
  { id: 'overworld', labelKey: 'nav_overworld', texture: '/textures/grass.png' },
  { id: 'cave', labelKey: 'nav_cave', texture: '/textures/stone.png' },
  { id: 'deep-dark', labelKey: 'nav_deepdark', texture: '/textures/sculk.png' },
  { id: 'nether', labelKey: 'nav_nether', texture: '/textures/netherrack.png' },
  { id: 'the-end', labelKey: 'nav_end', texture: '/textures/endstone.png' },
  { id: 'credits', labelKey: 'nav_credits', texture: '/textures/paper.png' },
]
