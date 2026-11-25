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
}

export const SECTIONS: SectionMeta[] = [
  { id: 'overworld', labelKey: 'nav_overworld' },
  { id: 'cave', labelKey: 'nav_cave' },
  { id: 'deep-dark', labelKey: 'nav_deepdark' },
  { id: 'nether', labelKey: 'nav_nether' },
  { id: 'the-end', labelKey: 'nav_end' },
  { id: 'credits', labelKey: 'nav_credits' },
]
