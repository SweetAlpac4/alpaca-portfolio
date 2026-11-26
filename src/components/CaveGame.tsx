import { useCallback, useEffect, useRef, useState } from 'react'
import { useLang } from '../i18n'
import { generateGrid, isReachable, PICKAXES, resolveMine, type CaveBlock, type CaveBlockContent, type OreId, type PickaxeTier, type RunSummary } from '../lib/cave'
import { useCave } from './CaveProvider'
import { MaterialIcon } from './MaterialIcons'
import { OreIcon, PickaxeIcon } from './OreIcons'
import { useFishing } from './FishingProvider'

type Props = { onClose: () => void }
type Run = RunSummary & { combo: number; durability: number; oresThisRun: number; quartzThisRun: number; glowstoneThisRun: number }
const initialRun = (tier: PickaxeTier): Run => ({ score: 0, bestCombo: 0, lavaHits: 0, blocks: 0, combo: 0, durability: PICKAXES[tier].durability, oresThisRun: 0, quartzThisRun: 0, glowstoneThisRun: 0 })
const ORES: OreId[] = ['coal', 'iron', 'gold', 'redstone', 'lapis', 'diamond', 'voidsteel']
const BLOCK_MARK: Record<CaveBlockContent, string> = { voidsteel: 'Vs', stone: '', gravel: 'GR', lava: '!!', coal: 'C', iron: 'Fe', gold: 'Au', redstone: 'Rs', lapis: 'Lp', diamond: 'Di', nether_quartz: 'Qz', glowstone_dust: 'Gl' }

export function CaveGame({ onClose }: Props) {
  const { t } = useLang()
  const { state, addOre, addMaterial, finishRun, upgrade } = useCave()
  const { state: fishing } = useFishing()
  const panel = useRef<HTMLDivElement>(null)
  const runRef = useRef<Run>(initialRun(state.pickaxe))
  const finishedRef = useRef(true)
  const elapsedRef = useRef(0)
  const [grid, setGrid] = useState<CaveBlock[]>(() => generateGrid(state.pickaxe))
  const [run, setRun] = useState<Run>(initialRun(state.pickaxe))
  const [running, setRunning] = useState(false)
  const [elapsed, setElapsed] = useState(0)
  const [paused, setPaused] = useState(false)
  const [result, setResult] = useState<Run | null>(null)
  const [message, setMessage] = useState('')
  const [newBest, setNewBest] = useState(false)
  const [announce, setAnnounce] = useState('')
  const [view, setView] = useState<'mine' | 'gear'>('mine')
  const maxRow = PICKAXES[state.pickaxe].maxRow
  const maxDurability = PICKAXES[state.pickaxe].durability

  const finish = useCallback((showResult: boolean) => {
    if (finishedRef.current) return
    finishedRef.current = true
    const final = { ...runRef.current }
    finishRun(final)
    if (showResult) {
      setRunning(false)
      setResult(final)
      setNewBest(final.score > state.bestScore)
    }
  }, [finishRun, state.bestScore])

  const startRun = useCallback(() => {
    const next = initialRun(state.pickaxe)
    runRef.current = next
    finishedRef.current = false
    setRun(next)
    if (result) setGrid(generateGrid(state.pickaxe))
    setElapsed(0)
    elapsedRef.current = 0
    setResult(null)
    setMessage('')
    setRunning(true)
  }, [result, state.pickaxe])

  const mine = useCallback((block: CaveBlock) => {
    if (!running || block.mined) return
    if (block.row > maxRow) {
      setMessage(t('cave_locked_row'))
      setAnnounce(t('cave_locked_row'))
      return
    }
    if (!isReachable(block, grid, maxRow)) {
      setMessage(t('cave_not_reachable'))
      setAnnounce(t('cave_not_reachable'))
      return
    }
    const before = runRef.current
    const resolution = resolveMine(block, before.durability, before.combo)
    let nextRun: Run = {
      ...before,
      score: before.score + resolution.score,
      combo: resolution.combo,
      bestCombo: Math.max(before.bestCombo, resolution.combo),
      lavaHits: before.lavaHits + (block.content === 'lava' ? 1 : 0),
      blocks: before.blocks + 1,
      durability: Math.max(0, before.durability - resolution.durabilityCost),
      oresThisRun: before.oresThisRun + (resolution.ore ? 1 : 0),
      quartzThisRun: before.quartzThisRun + (block.content === 'nether_quartz' ? resolution.materialAmount : 0),
      glowstoneThisRun: before.glowstoneThisRun + (block.content === 'glowstone_dust' ? resolution.materialAmount : 0),
    }
    runRef.current = nextRun
    setRun(nextRun)
    setGrid(current => current.map(item => item.id === block.id ? { ...item, mined: true } : item))
    if (resolution.ore) addOre(resolution.ore)
    if (resolution.material) addMaterial(resolution.material, resolution.materialAmount)
    const messages: Record<CaveBlockContent, string> = {
      stone: t('cave_stone_hit'), gravel: t('cave_gravel_hit'), lava: t('cave_lava_hit'),
      nether_quartz: `${t('cave_quartz_found')} +${resolution.materialAmount}`,
      glowstone_dust: `${t('cave_glowstone_found')} +${resolution.materialAmount}`,
      voidsteel: t('cave_ore_voidsteel'), coal: `${t('cave_ore_found')}: ${t('cave_ore_coal')}`, iron: `${t('cave_ore_found')}: ${t('cave_ore_iron')}`,
      gold: `${t('cave_ore_found')}: ${t('cave_ore_gold')}`, redstone: `${t('cave_ore_found')}: ${t('cave_ore_redstone')}`,
      lapis: `${t('cave_ore_found')}: ${t('cave_ore_lapis')}`, diamond: `${t('cave_ore_found')}: ${t('cave_ore_diamond')}`,
    }
    setMessage(messages[block.content])
    setAnnounce(messages[block.content])
    const remaining = grid.filter(item => item.row <= maxRow && !item.mined && item.id !== block.id).length
    if (nextRun.durability <= 0 || remaining === 0) finish(true)
  }, [addMaterial, addOre, finish, grid, maxRow, running, t])

  useEffect(() => {
    const previous = document.activeElement as HTMLElement | null
    panel.current?.focus()
    return () => {
      if (!finishedRef.current) finish(false)
      previous?.focus()
    }
  }, [finish])

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') { event.preventDefault(); onClose(); return }
      if (event.key === 'Tab') {
        const items = [...(panel.current?.querySelectorAll<HTMLElement>('button:not(:disabled), [tabindex="0"]') ?? [])]
        const first = items[0], last = items[items.length - 1]
        if (event.shiftKey && (document.activeElement === first || document.activeElement === panel.current)) { event.preventDefault(); last?.focus() }
        if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first?.focus() }
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [onClose])

  useEffect(() => {
    if (!running) return
    let last = performance.now()
    const visibility = () => { last = performance.now(); setPaused(document.hidden) }
    document.addEventListener('visibilitychange', visibility)
    const timer = window.setInterval(() => {
      const now = performance.now()
      const delta = now - last
      last = now
      if (document.hidden) { setPaused(true); return }
      setPaused(false)
      const next = Math.min(45000, elapsedRef.current + delta)
      elapsedRef.current = next
      setElapsed(next)
      if (next >= 45000) finish(true)
    }, 50)
    return () => { window.clearInterval(timer); document.removeEventListener('visibilitychange', visibility) }
  }, [finish, running])

  const nextTier = state.pickaxe === 'diamond' ? null : (['wood', 'stone', 'iron', 'diamond'] as PickaxeTier[])[(['wood', 'stone', 'iron', 'diamond'] as PickaxeTier[]).indexOf(state.pickaxe) + 1]
  const upgradeCost = nextTier ? PICKAXES[nextTier].cost : null
  const accessibleCount = grid.filter(block => block.row <= maxRow).length
  const cellLabel = (block: CaveBlock) => block.mined
    ? `${t('cave_depth')} ${block.row}, ${t('cave_column')} ${block.col}, ${t(`cave_ore_${block.content}` as never)}`
    : `${t('cave_depth')} ${block.row}, ${t('cave_column')} ${block.col}, ${t(`cave_ore_${block.content}` as never)}, ${t(block.row > maxRow ? 'cave_row_locked' : isReachable(block, grid, maxRow) ? 'cave_reachable' : 'cave_not_reachable')}`

  return <div className="cave-overlay" onPointerDown={event => { if (event.target === event.currentTarget) onClose() }}>
    <div className="cave-game" role="dialog" aria-modal="true" aria-labelledby="cave-title" tabIndex={-1} ref={panel}>
      <header className="cave-head"><div><p className="cave-eyebrow">{t('cave_location')}</p><h2 id="cave-title">Cave Miner — Ore Rush</h2><p>{t('cave_game_sub')}</p></div><button className="cave-close" onClick={onClose} aria-label={t('close')}>×</button></header>
      <div className="cave-stats"><span>{running ? t('cave_score') : t('cave_runs')} <strong>{running ? run.score : state.runs}</strong></span><span>{running ? t('cave_combo') : t('cave_best')} <strong>{running ? `×${run.combo}` : state.bestScore}</strong></span><span>{t('cave_total_ores')} <strong>{state.totalOres}</strong></span><span><PickaxeIcon tier={state.pickaxe}/><strong>{t(PICKAXES[state.pickaxe].label as never)}</strong></span></div>
      <div className="cave-view-tabs" role="tablist" aria-label={t('cave_game')}><button role="tab" aria-selected={view === 'mine'} onClick={() => setView('mine')}>{t('cave_view_mine')}</button><button role="tab" aria-selected={view === 'gear'} onClick={() => setView('gear')}>{t('cave_view_gear')}</button></div>
      <div className="cave-body" data-view={view}>
        <section className="cave-mine-area" aria-label={t('cave_game')}>
          <div className="cave-meter-row"><span>{t('cave_time')}</span><strong>{Math.ceil((45000 - elapsed) / 1000)}s</strong><meter min={0} max={45000} value={45000 - elapsed} aria-label={t('cave_time')}/></div>
          <div className="cave-meter-row"><span>{t('cave_durability')}</span><strong>{run.durability}/{maxDurability}</strong><meter min={0} max={maxDurability} value={run.durability} aria-label={t('cave_durability')}/></div>
          <div className="cave-action">{running ? <><strong>{t('cave_mining')}</strong><button className="cave-button cave-button--done" onClick={() => finish(true)} disabled={run.blocks === 0}>{t('cave_done_mining')}</button></> : <button className="cave-button" onClick={startRun}>{result || state.runs ? t('cave_dig_again') : t('cave_start')}</button>}</div>
          <div className="cave-board-space">
            <div className="cave-mine-grid" role="grid" aria-label="7 × 7 cave mining grid">
              {grid.map(block => {
                const locked = block.row > maxRow
                const reachable = isReachable(block, grid, maxRow)
                return <button key={block.id} role="gridcell" className={`cave-cell cave-cell--${block.content}${block.mined ? ' is-mined' : ''}${locked ? ' is-locked' : ''}${reachable && !result ? ' is-reachable' : ''}${!reachable && !locked && !block.mined ? ' is-distant' : ''}${block.content === 'diamond' && !block.mined ? ' is-glint' : ''}`} onClick={() => mine(block)} disabled={!running || block.mined} aria-label={cellLabel(block)} title={locked ? t('cave_locked_hint') : !reachable ? t('cave_route_hint') : t(`cave_ore_${block.content}` as never)}>
                  {locked ? <span className="cave-cell__lock"><PickaxeIcon tier={state.pickaxe}/><small>{block.row}</small></span> : block.mined ? <span className="cave-pit"/> : <><span className="cave-cell__ore">{ORES.includes(block.content as OreId) ? <OreIcon ore={block.content as OreId}/> : block.content === 'nether_quartz' || block.content === 'glowstone_dust' ? <MaterialIcon material={block.content}/> : <span className={`cave-cell__terrain cave-cell__terrain--${block.content}`}/>}</span><small>{BLOCK_MARK[block.content]}</small></>}
                </button>
              })}
            </div>
          </div>
          <div className="cave-legend" aria-label={t('cave_legend')}>
            {ORES.map(ore => <span key={ore}><OreIcon ore={ore}/>{t(`cave_ore_${ore}` as never)}</span>)}
            <span><MaterialIcon material="nether_quartz"/>{t('cave_ore_nether_quartz')}</span><span><MaterialIcon material="glowstone_dust"/>{t('cave_ore_glowstone_dust')}</span>
            <span className="cave-legend__lava">!! {t('cave_ore_lava')} −4</span><span>GR {t('cave_ore_gravel')} −2</span>
          </div>
          <div className="cave-live" role="status" aria-live="polite">{paused ? t('cave_paused') : result ? `${t('cave_run_over')}: ${result.score} ${t('cave_score')} · ${result.oresThisRun} ${t('cave_run_ores')}` : message || (running ? t('cave_help') : t('cave_route_hint'))}</div>
        </section>
        <aside className="cave-side">
          <div className="cave-score"><span>{t('cave_score')}</span><strong>{run.score}</strong><span>{t('cave_combo')} ×{run.combo}</span></div>
          {result && <div className="cave-result"><p className="cave-eyebrow">{t('cave_run_over')}</p><h3>{result.score} {t('cave_score')}</h3>{newBest && <strong>{t('cave_new_best')}</strong>}<p>{t('cave_run_ores')}: {result.oresThisRun} · {t('cave_best_combo')}: {result.bestCombo}</p><p>{t('cave_ore_lava')}: {result.lavaHits}</p>{(result.quartzThisRun > 0 || result.glowstoneThisRun > 0) && <p>{t('cave_material_drops')}: {result.quartzThisRun} {t('cave_ore_nether_quartz')} · {result.glowstoneThisRun} {t('cave_ore_glowstone_dust')}</p>}</div>}
          <section className="cave-upgrade"><h3>{t('cave_upgrade')}</h3><div className="cave-tier"><PickaxeIcon tier={state.pickaxe}/><strong>{t(PICKAXES[state.pickaxe].label as never)}</strong></div>{nextTier && upgradeCost ? <><p>{t('cave_upgrade_to')}: {t(PICKAXES[nextTier].label as never)}</p><p>{t('cave_upgrade_cost')}: {Object.entries(upgradeCost).map(([ore, amount]) => `${amount} ${t(`cave_ore_${ore}` as never)}`).join(' · ')}</p><button className="cave-button cave-button--secondary" disabled={running || !canAfford(state.ores, upgradeCost)} onClick={() => upgrade()}>{running ? t('cave_need_ores') : t('cave_upgrade')}</button></> : <p>{t('cave_upgrade_max')}</p>}</section>
          <details className="cave-vault"><summary>{t('cave_vault')} <strong>{Object.values(state.ores).reduce((sum, count) => sum + count, 0)}</strong></summary><div className="cave-ore-list">{ORES.map(ore => <span key={ore}><OreIcon ore={ore}/>{t(`cave_ore_${ore}` as never)} <strong>{state.ores[ore]}</strong></span>)}</div></details>
          <details className="cave-material-bag"><summary>{t('cave_material_bag')} <strong>{(fishing.materials.nether_quartz ?? 0) + (fishing.materials.glowstone_dust ?? 0)}</strong></summary>{(['nether_quartz', 'glowstone_dust'] as const).map(material => <span key={material}><MaterialIcon material={material}/>{t(material === 'nether_quartz' ? 'cave_ore_nether_quartz' : 'cave_ore_glowstone_dust')} <strong>{fishing.materials[material] ?? 0}</strong></span>)}</details>
          <p className="cave-hint">{t('cave_pause_hint')} {t('cave_close_hint')}</p>
          {accessibleCount === 0 && running && <small>{t('cave_row_locked')}</small>}
        </aside>
      </div>
      <div className="cave-live cave-live--sr" aria-live="assertive">{announce}</div>
    </div>
  </div>
}

function canAfford(ores: Record<OreId, number>, cost: Partial<Record<OreId, number>>) {
  return Object.entries(cost).every(([id, amount]) => ores[id as OreId] >= (amount ?? 0))
}
