import { useLang } from '../i18n'
import { PixelIcon } from './PixelIcon'
import { RodIcon } from './FishingIcons'
import { PickaxeIcon } from './OreIcons'
import type { PickaxeTier } from '../lib/cave'

import type { RodDef } from '../lib/fishing'

type Props = {
  onOpenBook: () => void
  found: number
  total: number
  activeBiome: number
  onOpenFishing: () => void
  onOpenNether: () => void
  rod: RodDef
  onOpenDeep: () => void
  onOpenCave: () => void
  pickaxeTier: PickaxeTier
}

export function LanguageToggle({ onOpenBook, found, total, activeBiome, onOpenFishing, onOpenNether, rod, onOpenDeep, onOpenCave, pickaxeTier }: Props) {
  const { lang, setLang, t } = useLang()

  return (
    <div className="world-tools">
      <button
        type="button"
        className="world-tools__book"
        onClick={onOpenBook}
        aria-label={`${t('achievement_book')} (${found}/${total})`}
        aria-keyshortcuts="E"
        title={t('achievement_book')}
      >
        <PixelIcon name="book" />
        <span className="world-tools__book-label">{t('achievement_book')}</span>
        <span className="world-tools__count">{found}/{total}</span>
      </button>
      {activeBiome === 0 && (
        <button type="button" className="world-tools__game" onClick={onOpenFishing} aria-label={t('fishing')}>
          <RodIcon rod={rod} />
        </button>
      )}
      {activeBiome === 1 && (
        <button type="button" className="world-tools__game" onClick={onOpenCave} aria-label={t('cave_open')} aria-keyshortcuts="C">
          <PickaxeIcon tier={pickaxeTier} />
        </button>
      )}
      {activeBiome === 2 && (
        <button type="button" className="world-tools__game" aria-label="Silent Steps" onClick={onOpenDeep}><PixelIcon name="sculk" /></button>
      )}
      {activeBiome === 3 && (
        <button type="button" className="world-tools__game world-tools__game--nether" onClick={onOpenNether} aria-label={t('brew_tab')}>
          <PixelIcon name="blaze" />
        </button>
      )}
      <div className="lang" role="group" aria-label={t('lang_label')}>
        <button
          type="button"
          className={`lang__btn${lang === 'en' ? ' lang__btn--active' : ''}`}
          onClick={() => setLang('en')}
          aria-pressed={lang === 'en'}
        >
          EN
        </button>
        <button
          type="button"
          className={`lang__btn${lang === 'id' ? ' lang__btn--active' : ''}`}
          onClick={() => setLang('id')}
          aria-pressed={lang === 'id'}
        >
          ID
        </button>
      </div>
    </div>
  )
}
