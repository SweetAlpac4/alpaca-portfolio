import { useCallback, useEffect, useRef, useState } from 'react'
import { useLang } from '../i18n'
import { MATERIALS, MATERIAL_BY_ID, hasMaterials, materialCount } from '../lib/materials'
import { BREW_RECIPES, RECIPE_BY_ID, brewCost, brewReward, type BrewRecipeId } from '../lib/nether'
import { advanceBrew, BREW_BEAT, BREW_DURATION, BREW_STEPS, createBrewSession, currentBeat, finishBrew, markerPosition, tapIngredient, ventBrew, VENT_COOLDOWN, type BrewResult } from '../lib/brewSession'
import { useFishing } from './FishingProvider'
import { useNether } from './NetherProvider'
import { MaterialIcon } from './MaterialIcons'
import { NetherScene } from './NetherScene'

type Props = { onClose: () => void; onGoToFishing: () => void }

export function NetherGame({ onClose, onGoToFishing }: Props) {
  const { t, pick } = useLang()
  const { state, begin, finish, cancel, setSoulFlame } = useNether()
  const { state: fishing, claimStarterKit } = useFishing()
  const [tab, setTab] = useState<'brew' | 'bag'>('brew')
  const [recipeId, setRecipeId] = useState<BrewRecipeId>('experience')
  const [running, setRunning] = useState(false)
  const [paused, setPaused] = useState(false)
  const [session, setSession] = useState(createBrewSession)
  const [result, setResult] = useState<BrewResult | null>(null)
  const [message, setMessage] = useState('')
  const panel = useRef<HTMLDivElement>(null)
  const sessionRef = useRef(session)
  const transaction = useRef<string | null>(null)
  const recipe = RECIPE_BY_ID[recipeId]
  const affordable = hasMaterials(fishing.materials, brewCost(recipe))
  const beat = currentBeat(session)
  const ingredient = recipe.ingredients[Math.floor(beat / 3)]
  const reward = brewReward(recipeId, result?.quality ?? 'good')

  const publish = useCallback((next: typeof session) => {
    sessionRef.current = next
    setSession(next)
  }, [])
  const start = () => {
    if (transaction.current) return
    const brew = begin(recipeId)
    if (!brew) { setMessage(t('brew_need_materials')); return }
    transaction.current = brew.id
    publish(createBrewSession())
    setResult(null)
    setMessage('')
    setRunning(true)
    setPaused(false)
  }
  const add = useCallback(() => {
    if (!transaction.current || document.hidden) return
    publish(tapIngredient(sessionRef.current, recipe.difficulty))
  }, [publish, recipe.difficulty])
  const vent = useCallback(() => {
    if (!transaction.current || document.hidden) return
    publish(ventBrew(sessionRef.current))
  }, [publish])

  useEffect(() => {
    const previous = document.activeElement as HTMLElement | null
    panel.current?.focus()
    return () => {
      if (transaction.current) cancel(transaction.current)
      previous?.focus()
    }
  }, [cancel])

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') { event.preventDefault(); onClose(); return }
      if (event.key === 'Tab') {
        const items = [...(panel.current?.querySelectorAll<HTMLElement>('button:not(:disabled), select:not(:disabled), input:not(:disabled), [tabindex="0"]') ?? [])]
        const first = items[0], last = items[items.length - 1]
        if (event.shiftKey && (document.activeElement === first || document.activeElement === panel.current)) { event.preventDefault(); last?.focus() }
        if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first?.focus() }
      }
      if (!running || event.ctrlKey || event.metaKey || event.altKey) return
      if (event.code === 'Space') { event.preventDefault(); if (!event.repeat) add() }
      if (event.code === 'KeyV') { event.preventDefault(); if (!event.repeat) vent() }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [add, vent, running, onClose])

  useEffect(() => {
    if (!running) return
    let last = performance.now()
    const visibility = () => { last = performance.now(); setPaused(document.hidden) }
    document.addEventListener('visibilitychange', visibility)
    const timer = window.setInterval(() => {
      const now = performance.now()
      const elapsed = now - last
      last = now
      if (document.hidden) return
      const next = advanceBrew(sessionRef.current, elapsed, recipe.difficulty)
      publish(next)
      if (next.elapsed >= BREW_DURATION && transaction.current) {
        const outcome = finishBrew(next)
        finish(transaction.current, outcome)
        transaction.current = null
        setResult(outcome)
        setRunning(false)
      }
    }, 50)
    return () => { window.clearInterval(timer); document.removeEventListener('visibilitychange', visibility) }
  }, [running, recipe.difficulty, publish, finish])

  const qualityLabel = result ? t(`brew_quality_${result.quality}`) : ''

  return (
    <div className="nether-overlay" onPointerDown={event => { if (event.target === event.currentTarget) onClose() }}>
      <div className={`nether-game${running ? ' nether-game--running' : ''}`} role="dialog" aria-modal="true" aria-labelledby="nether-title" tabIndex={-1} ref={panel}>
        <header className="nether-game__head">
          <div><p className="nether-eyebrow">{t('brew_location')}</p><h2 id="nether-title">Nether Brewmaster</h2><p>{t('brew_sub')}</p></div>
          <button className="nether-close" onClick={onClose} aria-label={t('close')}>×</button>
        </header>
        <div className="nether-game__stats">
          <span>{t('brew_total')} <strong>{state.brews}</strong></span>
          <span>{t('brew_best')} <strong>{state.bestScore}/100</strong></span>
          <span>{t('brew_quality_perfect')} <strong>{state.perfects}</strong></span>
          {state.perfects >= 5 && <span className="nether-title">Brewmaster</span>}
        </div>
        <div className="nether-tabs" role="tablist" aria-label="Nether Brewmaster">
          <button role="tab" aria-selected={tab === 'brew'} disabled={running} onClick={() => setTab('brew')}>{t('brew_tab')}</button>
          <button role="tab" aria-selected={tab === 'bag'} disabled={running} onClick={() => setTab('bag')}>{t('brew_bag')} <span>{fishing.materialsFound.length}/{MATERIALS.length}</span></button>
        </div>
        <div className="nether-game__body">
          {tab === 'brew' ? <>
            <div className="nether-workbench">
              <div className={`nether-world${session.heat > 85 && running ? ' is-hot' : ''}`}>
                <NetherScene heat={session.heat} brewing={running} soul={state.soulFlame} successful={result?.quality === 'perfect'} />
                <span className="nether-world__label">{t('brew_location')}</span>
                {running && <span className="nether-world__timer" aria-label={t('brew_time')}>{Math.ceil((BREW_DURATION - session.elapsed) / 1000)}s</span>}
                <div className="nether-world__caption" role="status">{paused ? t('brew_paused') : result ? qualityLabel : running ? pick(MATERIAL_BY_ID[ingredient].name) : t('brew_scene_idle')}</div>
              </div>
              <div className="nether-console">
                {!running && !result && <>
                  <label className="nether-label" htmlFor="brew-recipe">{t('brew_recipe')}</label>
                  <select id="brew-recipe" value={recipeId} onChange={event => { setRecipeId(event.target.value as BrewRecipeId); setMessage('') }}>
                    {BREW_RECIPES.map(item => <option key={item.id} value={item.id} disabled={!state.recipes.includes(item.id)}>{pick(item.name)}{!state.recipes.includes(item.id) ? ` (${item.unlockAt} ${t('brew_runs')})` : ''}</option>)}
                  </select>
                  <div className="nether-ingredients">
                    {recipe.ingredients.map((id, i) => <div key={`${id}-${i}`} className={materialCount(fishing.materials, id) > 0 ? '' : 'is-missing'} title={pick(MATERIAL_BY_ID[id].name)}><MaterialIcon material={id} /><span>{pick(MATERIAL_BY_ID[id].name)}</span><strong>{materialCount(fishing.materials, id)}/1</strong></div>)}
                  </div>
                  <p className="nether-reward">{reward.emberBait ? `${t('ember_bait')} +${reward.emberBait}` : `${t('luck_potion')} +${reward.luck}`} {t('brew_casts')}</p>
                  <p className="nether-help">{t('brew_help')}</p>
                  {!fishing.starterClaimed && <button className="nether-button nether-button--secondary" onClick={claimStarterKit}>{t('brew_starter')}</button>}
                  {message && <p role="alert" className="nether-warning">{message}</p>}
                  <button className="nether-button" onClick={start} disabled={!affordable}>{t('brew_start')}</button>
                  {!affordable && <button className="nether-link" onClick={onGoToFishing}>{t('brew_go_overworld')}</button>}
                </>}
                {running && <>
                  <div className="nether-heat">
                    <div className="nether-label"><span>{t('brew_heat')}</span><strong>{Math.round(session.heat)}%</strong></div>
                    <div className={`nether-gauge${session.heat > 75 ? ' is-danger' : ''}`} role="meter" aria-label={t('brew_heat')} aria-valuenow={Math.round(session.heat)} aria-valuemin={0} aria-valuemax={100}>
                      <span className="nether-gauge__safe" /><span className="nether-gauge__fill" style={{ width: `${session.heat}%` }} />
                    </div>
                    <small>{t('brew_safe_heat')}</small>
                  </div>
                  <div className="nether-steps" aria-label={`${t('brew_step')} ${beat + 1}/${BREW_STEPS}`}>
                    {session.hits.map((hit, i) => <span key={i} className={`${i === beat ? 'is-current ' : ''}${hit === null ? '' : hit > 0 ? 'is-hit' : 'is-miss'}`}>{hit === null ? i + 1 : hit > 0 ? '+' : '×'}</span>)}
                  </div>
                  <div className="nether-timing-label"><MaterialIcon material={ingredient} /><span>{pick(MATERIAL_BY_ID[ingredient].name)}<small>{t('brew_pinch')} {beat % 3 + 1}/3</small></span></div>
                  <div className="nether-timing" aria-label={t('brew_timing')} role="meter" aria-valuemin={0} aria-valuemax={100} aria-valuenow={Math.round(markerPosition(session.elapsed, recipe.difficulty))}>
                    <span className="nether-timing__target" /><span className="nether-timing__marker" style={{ left: `${markerPosition(session.elapsed, recipe.difficulty)}%` }} />
                  </div>
                  <p className="nether-feedback" role="status">{session.hits[beat] === null ? t('brew_timing') : (session.hits[beat] ?? 0) > 0 ? t('brew_hit') : t('brew_miss')}</p>
                  <div className="nether-actions">
                    <button className="nether-button" onClick={add} disabled={session.hits[beat] !== null || paused}>{t('brew_add')}<kbd>Space</kbd></button>
                    <button className="nether-button nether-button--secondary" onClick={vent} disabled={session.elapsed - session.lastVent < VENT_COOLDOWN || paused}>{t('brew_vent')}<kbd>V</kbd></button>
                  </div>
                  <p className="nether-combo">{t('brew_combo')} ×{session.combo} <span>{t('brew_next')} {Math.ceil((BREW_BEAT - session.elapsed % BREW_BEAT) / 1000)}s</span></p>
                </>}
                {result && <div className={`nether-result nether-result--${result.quality}`}>
                  <p className="nether-eyebrow">{pick(recipe.name)}</p>
                  <h3>{qualityLabel}</h3><strong className="nether-result__score">{result.score}<small>/100</small></strong>
                  <p>{result.hits}/{BREW_STEPS} {t('brew_hits')} · {t('brew_combo')} ×{result.bestCombo}</p>
                  <p className="nether-reward">{result.quality === 'ruined' ? t('brew_refund_all') : result.quality === 'awkward' ? t('brew_refund_one') : `${reward.emberBait ? t('ember_bait') : t('luck_potion')} +${reward.emberBait || reward.luck} ${t('brew_casts')}`}</p>
                  {result.quality === 'perfect' && <p className="nether-reward">+1 {t('nether_ember')}</p>}
                  {BREW_RECIPES.filter(item => item.unlockAt === state.brews).map(item => <p key={item.id} className="nether-reward">{t('brew_recipe_unlocked')}: {pick(item.name)}</p>)}
                  <button className="nether-button" onClick={() => { setResult(null); publish(createBrewSession()) }}>{t('brew_again')}</button>
                  <button className="nether-link" onClick={onGoToFishing}>{t('brew_go_overworld')}</button>
                </div>}
              </div>
            </div>
            <footer className="nether-footer">
              <p>{running ? t('brew_exit_refund') : t('brew_progress_hint')}<br />{t('brew_pause_hint')}</p>
              <label className="nether-cosmetic"><input type="checkbox" checked={state.soulFlame} disabled={state.perfects < 5 || running} onChange={event => setSoulFlame(event.target.checked)} />{t('brew_soul_flame')} <span>{Math.min(state.perfects, 5)}/5</span></label>
            </footer>
          </> : <section className="nether-bag">
            <div><h3>{t('brew_bag')}</h3><p>{t('rift_materials_sub')}</p></div>
            <div className="nether-bag__grid">
              {MATERIALS.map(item => <article key={item.id} className="nether-material"><MaterialIcon material={item.id} /><div><h4>{pick(item.name)}</h4><p>{pick(item.description)}</p><small>{fishing.materialsFound.includes(item.id) ? t('found') : t('material_locked_hint')}</small></div><strong>×{materialCount(fishing.materials, item.id)}</strong></article>)}
            </div>
            <div className="nether-effects"><p>{t('ember_bait')}: <strong>{fishing.effects.emberBait}</strong> {t('brew_casts')}</p><p>{t('luck_potion')}: <strong>{fishing.effects.luck}</strong> {t('brew_casts')}</p><p>{t('nether_ember')}: <strong>{state.embers}</strong></p></div>
            <p className="nether-help">{t('brew_effects_help')}</p>
            <button className="nether-button" onClick={onGoToFishing}>{t('brew_go_overworld')}</button>
          </section>}
        </div>
      </div>
    </div>
  )
}
