import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type PointerEvent as ReactPointerEvent,
} from 'react'
import { useLang } from '../i18n'
import {
  FISH,
  FISH_BY_ID,
  MAX_CHEST_SIZE,
  RARITY_LABEL_KEY,
  RODS,
  ROD_BY_ID,
  SIZE_LABEL_KEY,
  formatLength,
  formatWeight,
  rodRequirementProgress,
  rollCatch,
  type CatchRoll,
  type FishCatch,
  type RodDef,
} from '../lib/fishing'
import { hasSecretItem } from '../lib/secrets'
import { useFishing } from './FishingProvider'
import { FishIcon, RodIcon } from './FishingIcons'
import { FishingScene } from './FishingScene'

type Tab = 'cast' | 'chest' | 'journal' | 'rods'
type Phase = 'idle' | 'casting' | 'waiting' | 'bite' | 'reeling' | 'result'
type EscapeReason = 'late' | 'snap'
type TimePhase = 'night' | 'dawn' | 'day' | 'dusk'
type Result =
  | { kind: 'catch'; fish: FishCatch; perfect: boolean }
  | { kind: 'escape'; reason: EscapeReason }

type Props = {
  onClose: () => void
}

const EMPTY_SLOTS = Array.from({ length: MAX_CHEST_SIZE }, (_, index) => index)

const TIME_PHASE_KEY = {
  night: 'time_night',
  dawn: 'time_dawn',
  day: 'time_day',
  dusk: 'time_dusk',
} as const

function getTimePhase(date: Date): TimePhase {
  const hour = date.getHours()
  if (hour >= 5 && hour < 7) return 'dawn'
  if (hour >= 7 && hour < 17) return 'day'
  if (hour >= 17 && hour < 19) return 'dusk'
  return 'night'
}

export function FishingGame({ onClose }: Props) {
  const { t, pick, lang } = useLang()
  const {
    state,
    selectedRod,
    speciesFound,
    chestFull,
    recordCast,
    recordCatch,
    recordEscape,
    selectRod,
    releaseFish,
    reset,
  } = useFishing()

  const [tab, setTab] = useState<Tab>('cast')
  const [phase, setPhase] = useState<Phase>('idle')
  const [result, setResult] = useState<Result | null>(null)
  const [tension, setTension] = useState(0)
  const [progress, setProgress] = useState(0)
  const [holding, setHolding] = useState(false)
  const [now, setNow] = useState(() => new Date())
  const [message, setMessage] = useState('')
  const [newRods, setNewRods] = useState<RodDef[]>([])
  const [chestSort, setChestSort] = useState<'newest' | 'heaviest'>('newest')
  const [selectedCatchId, setSelectedCatchId] = useState<string | null>(null)
  const [confirmRelease, setConfirmRelease] = useState<string | null>(null)
  const [confirmReset, setConfirmReset] = useState(false)

  const panelRef = useRef<HTMLDivElement>(null)
  const timersRef = useRef<number[]>([])
  const phaseRef = useRef<Phase>('idle')
  const holdingRef = useRef(false)
  const progressRef = useRef(0)
  const tensionRef = useRef(0)
  const maxTensionRef = useRef(0)
  const dangerRef = useRef(0)
  const pendingCatchRef = useRef<CatchRoll | null>(null)
  const finishedRef = useRef(false)

  useEffect(() => {
    phaseRef.current = phase
  }, [phase])

  useEffect(() => {
    const timer = window.setInterval(() => setNow(new Date()), 30000)
    return () => window.clearInterval(timer)
  }, [])

  const clearTimers = useCallback(() => {
    for (const timer of timersRef.current) window.clearTimeout(timer)
    timersRef.current = []
  }, [])

  const later = useCallback((fn: () => void, ms: number) => {
    const timer = window.setTimeout(fn, ms)
    timersRef.current.push(timer)
    return timer
  }, [])

  useEffect(() => {
    const previous = document.activeElement as HTMLElement | null
    panelRef.current?.focus()
    return () => {
      clearTimers()
      previous?.focus()
    }
  }, [clearTimers])

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        event.preventDefault()
        onClose()
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [onClose])

  useEffect(() => {
    if (!confirmRelease) return
    const timer = window.setTimeout(() => setConfirmRelease(null), 3200)
    return () => window.clearTimeout(timer)
  }, [confirmRelease])

  useEffect(() => {
    const releasePointer = () => {
      holdingRef.current = false
      setHolding(false)
    }
    window.addEventListener('pointerup', releasePointer)
    window.addEventListener('pointercancel', releasePointer)
    window.addEventListener('blur', releasePointer)
    return () => {
      window.removeEventListener('pointerup', releasePointer)
      window.removeEventListener('pointercancel', releasePointer)
      window.removeEventListener('blur', releasePointer)
    }
  }, [])

  useEffect(() => {
    if (!confirmReset) return
    const timer = window.setTimeout(() => setConfirmReset(false), 3200)
    return () => window.clearTimeout(timer)
  }, [confirmReset])

  const finishEscape = useCallback(
    (reason: EscapeReason) => {
      if (finishedRef.current) return
      finishedRef.current = true
      clearTimers()
      holdingRef.current = false
      setHolding(false)
      recordEscape()
      setResult({ kind: 'escape', reason })
      setPhase('result')
    },
    [clearTimers, recordEscape],
  )

  const finishCatch = useCallback(() => {
    if (finishedRef.current) return
    const roll = pendingCatchRef.current
    if (!roll) {
      finishEscape('snap')
      return
    }
    finishedRef.current = true
    clearTimers()
    holdingRef.current = false
    setHolding(false)
    const fish: FishCatch = {
      ...roll,
      id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      rod: selectedRod.id,
      caughtAt: Date.now(),
    }
    const perfect = maxTensionRef.current <= 82
    const unlocked = recordCatch(fish, perfect)
    setNewRods(unlocked)
    setResult({ kind: 'catch', fish, perfect })
    setPhase('result')
  }, [clearTimers, finishEscape, recordCatch, selectedRod.id])

  const beginCast = useCallback(() => {
    if (phase !== 'idle' && phase !== 'result') return
    if (chestFull) {
      setMessage(t('chest_full'))
      return
    }

    clearTimers()
    setMessage('')
    setNewRods([])
    setResult(null)
    setTab('cast')
    setTension(0)
    setProgress(0)
    tensionRef.current = 0
    progressRef.current = 0
    maxTensionRef.current = 0
    dangerRef.current = 0
    pendingCatchRef.current = null
    finishedRef.current = false
    holdingRef.current = false
    setHolding(false)
    recordCast()
    setPhase('casting')

    later(() => {
      setPhase('waiting')
      const wait = 1200 + Math.random() * 2200
      later(() => {
        setPhase('bite')
        later(() => finishEscape('late'), selectedRod.biteWindow)
      }, wait)
    }, 550)
  }, [
    chestFull,
    clearTimers,
    finishEscape,
    later,
    phase,
    recordCast,
    selectedRod.biteWindow,
    t,
  ])

  const startReel = useCallback(() => {
    if (phase !== 'bite') return
    clearTimers()
    const secretAvailable =
      hasSecretItem('echo_shard') && !state.discovered.echo_fish
    const roll = rollCatch(
      selectedRod,
      secretAvailable,
      Boolean(state.discovered.echo_fish),
    )
    pendingCatchRef.current = roll
    finishedRef.current = false
    tensionRef.current = 0
    progressRef.current = 0
    maxTensionRef.current = 0
    dangerRef.current = 0
    setTension(0)
    setProgress(0)
    setPhase('reeling')
  }, [clearTimers, phase, selectedRod, state.discovered])

  const onPrimaryDown = (event: ReactPointerEvent<HTMLButtonElement>) => {
    event.preventDefault()
    if (phase === 'bite') {
      startReel()
      holdingRef.current = true
      setHolding(true)
    } else if (phase === 'reeling') {
      holdingRef.current = true
      setHolding(true)
    }
  }

  const releaseHold = () => {
    holdingRef.current = false
    setHolding(false)
  }

  useEffect(() => {
    if (phase !== 'reeling') return
    const interval = window.setInterval(() => {
      const dt = 0.05
      if (holdingRef.current) {
        tensionRef.current += selectedRod.tensionRate * dt
        progressRef.current += selectedRod.reelSpeed * dt
      } else {
        tensionRef.current -= selectedRod.tensionRate * 1.15 * dt
        progressRef.current -= selectedRod.reelSpeed * 0.3 * dt
      }

      tensionRef.current = Math.max(0, Math.min(100, tensionRef.current))
      progressRef.current = Math.max(0, Math.min(100, progressRef.current))
      maxTensionRef.current = Math.max(
        maxTensionRef.current,
        tensionRef.current,
      )
      if (tensionRef.current >= 100) {
        dangerRef.current += dt
      } else {
        dangerRef.current = 0
      }

      setTension(tensionRef.current)
      setProgress(progressRef.current)

      if (progressRef.current >= 100) {
        finishCatch()
        return
      }
      if (dangerRef.current >= 0.45) {
        finishEscape('snap')
      }
    }, 50)

    return () => window.clearInterval(interval)
  }, [finishCatch, finishEscape, phase, selectedRod])

  useEffect(() => {
    const isEditable = (target: EventTarget | null) => {
      const element = target as HTMLElement | null
      return Boolean(
        element &&
          (/^(INPUT|TEXTAREA|SELECT)$/.test(element.tagName) ||
            element.isContentEditable),
      )
    }

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.code !== 'Space' || isEditable(event.target)) return
      event.preventDefault()
      if (event.repeat) return
      if (phaseRef.current === 'idle' || phaseRef.current === 'result') {
        beginCast()
      } else if (phaseRef.current === 'bite') {
        startReel()
        holdingRef.current = true
        setHolding(true)
      } else if (phaseRef.current === 'reeling') {
        holdingRef.current = true
        setHolding(true)
      }
    }

    const onKeyUp = (event: KeyboardEvent) => {
      if (event.code !== 'Space') return
      holdingRef.current = false
      setHolding(false)
    }

    window.addEventListener('keydown', onKeyDown)
    window.addEventListener('keyup', onKeyUp)
    return () => {
      window.removeEventListener('keydown', onKeyDown)
      window.removeEventListener('keyup', onKeyUp)
    }
  }, [beginCast, startReel])

  const busy =
    phase === 'casting' ||
    phase === 'waiting' ||
    phase === 'bite' ||
    phase === 'reeling'

  const switchTab = (next: Tab) => {
    if (busy) return
    setTab(next)
    setMessage('')
  }

  const sortedChest = useMemo(() => {
    const chest = [...state.chest]
    if (chestSort === 'heaviest') {
      chest.sort((a, b) => b.weight - a.weight)
    } else {
      chest.sort((a, b) => b.caughtAt - a.caughtAt)
    }
    return chest
  }, [chestSort, state.chest])

  const selectedCatch =
    state.chest.find((fish) => fish.id === selectedCatchId) ?? null
  const selectedFish = selectedCatch
    ? FISH_BY_ID[selectedCatch.species]
    : null

  useEffect(() => {
    if (selectedCatchId && !state.chest.some((fish) => fish.id === selectedCatchId)) {
      setSelectedCatchId(null)
    }
  }, [selectedCatchId, state.chest])

  const onRelease = () => {
    if (!selectedCatch) return
    if (confirmRelease !== selectedCatch.id) {
      setConfirmRelease(selectedCatch.id)
      return
    }
    releaseFish(selectedCatch.id)
    setSelectedCatchId(null)
    setConfirmRelease(null)
  }

  const onResetFishing = () => {
    if (!confirmReset) {
      setConfirmReset(true)
      return
    }
    reset()
    setConfirmReset(false)
    setResult(null)
    setNewRods([])
    setPhase('idle')
    setSelectedCatchId(null)
    setMessage('')
  }

  const selectedRodName = pick(selectedRod.name)
  const caughtSpecies = speciesFound
  const journalPercent = (caughtSpecies / FISH.length) * 100
  const timePhase = getTimePhase(now)
  const timeLabel = now.toLocaleTimeString(lang === 'id' ? 'id-ID' : 'en-US', {
    hour: '2-digit',
    minute: '2-digit',
    hourCycle: 'h23',
  })

  return (
    <div
      className="fishing-overlay"
      onPointerDown={(event) => {
        if (event.target === event.currentTarget) onClose()
      }}
    >
      <div
        className="fishing"
        role="dialog"
        aria-modal="true"
        aria-labelledby="fishing-title"
        tabIndex={-1}
        ref={panelRef}
      >
        <header className="fishing__head">
          <div>
            <p className="eyebrow">{t('fishing_location')}</p>
            <h2 id="fishing-title" className="fishing__title">
              {t('fishing')}
            </h2>
            <p className="fishing__sub">{t('fishing_sub')}</p>
          </div>
          <button
            type="button"
            className="fishing__close"
            onClick={onClose}
            aria-label={t('close')}
          >
            ×
          </button>
        </header>

        <div className="fishing__meta">
          <span className="fishing__pill fishing__pill--rod">
            <RodIcon color={selectedRod.color} className="fishing__pill-icon" />
            {selectedRodName}
          </span>
          <span className="fishing__pill">
            {t('catches')}: {state.stats.catches}
          </span>
          <span className="fishing__pill">
            {t('species_found')}: {caughtSpecies}/{FISH.length}
          </span>
          <span className="fishing__pill">
            {t('best_streak')}: {state.stats.bestStreak}
          </span>
        </div>

        <div className="fishing__tabs" role="tablist" aria-label={t('fishing')}>
          <button
            type="button"
            role="tab"
            aria-selected={tab === 'cast'}
            className={`fishing__tab${tab === 'cast' ? ' is-active' : ''}`}
            onClick={() => switchTab('cast')}
            disabled={busy}
          >
            {t('cast')}
          </button>
          <button
            type="button"
            role="tab"
            aria-selected={tab === 'chest'}
            className={`fishing__tab${tab === 'chest' ? ' is-active' : ''}`}
            onClick={() => switchTab('chest')}
            disabled={busy}
          >
            {t('chest')}{' '}
            <span>
              {state.chest.length}/{MAX_CHEST_SIZE}
            </span>
          </button>
          <button
            type="button"
            role="tab"
            aria-selected={tab === 'journal'}
            className={`fishing__tab${tab === 'journal' ? ' is-active' : ''}`}
            onClick={() => switchTab('journal')}
            disabled={busy}
          >
            {t('journal')}{' '}
            <span>
              {caughtSpecies}/{FISH.length}
            </span>
          </button>
          <button
            type="button"
            role="tab"
            aria-selected={tab === 'rods'}
            className={`fishing__tab${tab === 'rods' ? ' is-active' : ''}`}
            onClick={() => switchTab('rods')}
            disabled={busy}
          >
            {t('rods')} <span>{state.rods.length}/{RODS.length}</span>
          </button>
        </div>

        <div className="fishing__body">
          {tab === 'cast' && (
            <section className="fishing-cast">
              <div
                className={`fishing-pond fishing-pond--${phase} fishing-pond--time-${timePhase}`}
              >
                <FishingScene
                  phase={phase}
                  timePhase={timePhase}
                  progress={progress}
                  holding={holding}
                  rodColor={selectedRod.color}
                />
                <div className="fishing-pond__location" aria-hidden="true">
                  <span>{t('fishing_location')}</span>
                  <small>{t('fishing_location_sub')}</small>
                </div>
                <div className="fishing-pond__time">
                  <span className="fishing-pond__clock">{timeLabel}</span>
                  <span className="fishing-pond__time-phase">
                    {t(TIME_PHASE_KEY[timePhase])}
                  </span>
                </div>
                {phase === 'bite' && <span className="fishing-bite" aria-hidden="true">!</span>}
                <div className={`fishing-pond__caption${phase === 'bite' ? ' is-bite' : ''}`} aria-live="polite">
                  {phase === 'idle' && t('fishing_scene_idle')}
                  {phase === 'casting' && t('casting')}
                  {phase === 'waiting' && t('waiting_bite')}
                  {phase === 'bite' && t('bite')}
                  {phase === 'reeling' && (holding ? t('reeling') : t('release_to_slack'))}
                  {phase === 'result' && (result?.kind === 'catch' ? t('caught') : t('escaped'))}
                </div>
              </div>

              <div className={`fishing-controls fishing-controls--${phase}`}>
                {message && <p className="fishing-warning">{message}</p>}

                {phase === 'idle' && (
                  <>
                    <p className="fishing-hint">{t('fishing_help')}</p>
                    <button
                      type="button"
                      className="mc-btn fishing-action"
                      onClick={beginCast}
                      disabled={chestFull}
                    >
                      {t('cast')}
                    </button>
                  </>
                )}

                {phase === 'casting' && (
                  <button type="button" className="mc-btn fishing-action" disabled>{t('casting')}</button>
                )}

                {phase === 'waiting' && (
                  <button type="button" className="mc-btn fishing-action" disabled>{t('waiting_bite')}</button>
                )}

                {phase === 'bite' && (
                  <>
                    <p className="fishing-status fishing-status--bite">
                      {t('bite')}
                    </p>
                    <button
                      type="button"
                      className="mc-btn fishing-action fishing-action--bite"
                      onPointerDown={onPrimaryDown}
                      onPointerUp={releaseHold}
                      onPointerCancel={releaseHold}
                      onPointerLeave={releaseHold}
                      onClick={() => {
                        if (phase === 'bite') startReel()
                      }}
                    >
                      {t('reel')}
                    </button>
                  </>
                )}

                {phase === 'reeling' && (
                  <>
                    <div className="fishing-meters">
                      <div className="fishing-meter">
                        <div className="fishing-meter__top">
                          <span>{t('tension')}</span>
                          <span>{Math.round(tension)}%</span>
                        </div>
                        <div className="fishing-meter__track">
                          <span className="fishing-meter__safe" />
                          <span
                            className={`fishing-meter__fill${
                              tension > 82 ? ' is-danger' : ''
                            }`}
                            style={{ width: `${tension}%` }}
                          />
                        </div>
                      </div>
                      <div className="fishing-meter fishing-meter--catch">
                        <div className="fishing-meter__top">
                          <span>{t('catch_progress')}</span>
                          <span>{Math.round(progress)}%</span>
                        </div>
                        <div className="fishing-meter__track">
                          <span
                            className="fishing-meter__fill is-catch"
                            style={{ width: `${progress}%` }}
                          />
                        </div>
                      </div>
                    </div>
                    <p className="fishing-hint">{t('release_to_slack')}</p>
                    <button
                      type="button"
                      className={`mc-btn fishing-action fishing-action--hold${
                        holding ? ' is-holding' : ''
                      }`}
                      onPointerDown={onPrimaryDown}
                      onPointerUp={releaseHold}
                      onPointerCancel={releaseHold}
                      onPointerLeave={releaseHold}
                    >
                      {t('hold_to_reel')}
                    </button>
                  </>
                )}

                {phase === 'result' && result && (
                  <div
                    className={`fishing-result${
                      result.kind === 'catch'
                        ? ' fishing-result--catch'
                        : ' fishing-result--escape'
                    }`}
                  >
                    {result.kind === 'catch' ? (
                      <>
                        <div className="fishing-result__icon">
                          <FishIcon species={result.fish.species} />
                        </div>
                        <div className="fishing-result__body">
                          <p className="fishing-result__eyebrow">
                            {result.perfect ? t('perfect') : t('caught')}
                          </p>
                          <h3>
                            {pick(FISH_BY_ID[result.fish.species].name)}
                          </h3>
                          <p className="fishing-result__meta">
                            {t(RARITY_LABEL_KEY[result.fish.rarity])} ·{' '}
                            {formatWeight(result.fish.weight)} ·{' '}
                            {formatLength(result.fish.length)} ·{' '}
                            {t(SIZE_LABEL_KEY[result.fish.size])}
                          </p>
                          <p className="fishing-result__desc">
                            {pick(FISH_BY_ID[result.fish.species].description)}
                          </p>
                          {newRods.length > 0 && (
                            <p className="fishing-unlock">
                              {t('new_rod_unlocked')}:{' '}
                              {newRods.map((rod) => pick(rod.name)).join(', ')}
                            </p>
                          )}
                        </div>
                      </>
                    ) : (
                      <div className="fishing-result__body">
                        <p className="fishing-result__eyebrow">
                          {result.reason === 'snap'
                            ? t('line_snapped')
                            : t('escaped')}
                        </p>
                        <p className="fishing-result__desc">
                          {t('fishing_locked_hint')}
                        </p>
                      </div>
                    )}
                    <button
                      type="button"
                      className="mc-btn fishing-action fishing-action--small"
                      onClick={beginCast}
                      disabled={chestFull}
                    >
                      {t('cast_again')}
                    </button>
                  </div>
                )}

                {chestFull && (
                  <p className="fishing-warning">{t('chest_full')}</p>
                )}
              </div>
            </section>
          )}

          {tab === 'chest' && (
            <section className="fishing-section">
              <div className="fishing-section__head">
                <div>
                  <h3>{t('chest')}</h3>
                  <p>
                    {t('chest_capacity')}: {state.chest.length}/
                    {MAX_CHEST_SIZE}
                  </p>
                </div>
                <div className="fishing-sort">
                  <button
                    type="button"
                    className={chestSort === 'newest' ? 'is-active' : ''}
                    onClick={() => setChestSort('newest')}
                  >
                    {t('sort_newest')}
                  </button>
                  <button
                    type="button"
                    className={chestSort === 'heaviest' ? 'is-active' : ''}
                    onClick={() => setChestSort('heaviest')}
                  >
                    {t('sort_heaviest')}
                  </button>
                </div>
              </div>

              {state.chest.length === 0 && (
                <p className="fishing-empty">{t('chest_empty')}</p>
              )}

              <div className="fishing-chest">
                {EMPTY_SLOTS.map((slot) => {
                  const fish = sortedChest[slot]
                  return (
                    <button
                      key={slot}
                      type="button"
                      className={`fishing-slot${
                        fish ? ' has-fish' : ''
                      }${fish && selectedCatchId === fish.id ? ' is-selected' : ''}`}
                      onClick={() => fish && setSelectedCatchId(fish.id)}
                      disabled={!fish}
                      aria-label={
                        fish ? pick(FISH_BY_ID[fish.species].name) : undefined
                      }
                    >
                      {fish && <FishIcon species={fish.species} />}
                    </button>
                  )
                })}
              </div>

              {selectedCatch && selectedFish && (
                <div className="fishing-detail">
                  <div className="fishing-detail__icon">
                    <FishIcon species={selectedCatch.species} />
                  </div>
                  <div className="fishing-detail__body">
                    <h4>{pick(selectedFish.name)}</h4>
                    <p className="fishing-detail__rarity">
                      {t(RARITY_LABEL_KEY[selectedCatch.rarity])} ·{' '}
                      {t(SIZE_LABEL_KEY[selectedCatch.size])}
                    </p>
                    <div className="fishing-detail__grid">
                      <span>
                        {t('weight')}: {formatWeight(selectedCatch.weight)}
                      </span>
                      <span>
                        {t('length')}: {formatLength(selectedCatch.length)}
                      </span>
                      <span>
                        {t('selected_rod')}:{' '}
                        {pick(ROD_BY_ID[selectedCatch.rod].name)}
                      </span>
                      <span>
                        {t('caught_on')}:{' '}
                        {new Date(selectedCatch.caughtAt).toLocaleDateString(
                          lang === 'id' ? 'id-ID' : 'en-US',
                          { day: 'numeric', month: 'short', year: 'numeric' },
                        )}
                      </span>
                    </div>
                  </div>
                  <button
                    type="button"
                    className={`mc-btn mc-btn--small ${
                      confirmRelease === selectedCatch.id
                        ? 'mc-btn--danger'
                        : 'mc-btn--ghost'
                    }`}
                    onClick={onRelease}
                  >
                    {confirmRelease === selectedCatch.id
                      ? t('release_confirm')
                      : t('release')}
                  </button>
                </div>
              )}
            </section>
          )}

          {tab === 'journal' && (
            <section className="fishing-section">
              <div className="fishing-section__head">
                <div>
                  <h3>{t('journal')}</h3>
                  <p>{t('journal_sub')}</p>
                </div>
                <span className="fishing-progress-label">
                  {caughtSpecies}/{FISH.length}
                </span>
              </div>

              <div className="fishing-progress">
                <span style={{ width: `${journalPercent}%` }} />
              </div>

              <div className="fishing-stats-grid">
                <div>
                  <span>{t('casts')}</span>
                  <strong>{state.stats.casts}</strong>
                </div>
                <div>
                  <span>{t('catches')}</span>
                  <strong>{state.stats.catches}</strong>
                </div>
                <div>
                  <span>{t('escapes')}</span>
                  <strong>{state.stats.escapes}</strong>
                </div>
                <div>
                  <span>{t('best_streak')}</span>
                  <strong>{state.stats.bestStreak}</strong>
                </div>
                <div>
                  <span>{t('total_weight')}</span>
                  <strong>{formatWeight(state.stats.totalWeight)}</strong>
                </div>
              </div>

              <div className="fishing-journal">
                {FISH.map((fish) => {
                  const record = state.discovered[fish.id]
                  const caught = Boolean(record)
                  return (
                    <article
                      key={fish.id}
                      className={`fish-card${
                        caught ? ' fish-card--caught' : ' fish-card--locked'
                      }${fish.secret ? ' fish-card--secret' : ''}`}
                    >
                      <div
                        className={`fish-card__icon${
                          caught ? '' : ' is-silhouette'
                        }`}
                      >
                        <FishIcon species={fish.id} />
                      </div>
                      <div className="fish-card__body">
                        <div className="fish-card__top">
                          <h4>{caught ? pick(fish.name) : t('unknown')}</h4>
                          <span
                            className={`fish-card__rarity fishing-rarity--${fish.rarity}`}
                          >
                            {t(RARITY_LABEL_KEY[fish.rarity])}
                          </span>
                        </div>
                        {caught && record ? (
                          <>
                            <p className="fish-card__desc">
                              {pick(fish.description)}
                            </p>
                            <div className="fish-card__stats">
                              <span>×{record.count}</span>
                              <span>★ {formatWeight(record.bestWeight)}</span>
                              <span>
                                ↔ {formatLength(record.bestLength)} ·{' '}
                                {t(SIZE_LABEL_KEY[record.bestSize])}
                              </span>
                            </div>
                          </>
                        ) : (
                          <>
                            <p className="fish-card__desc">
                              {fish.secret
                                ? t('secret_fish_hint')
                                : t('fishing_locked_hint')}
                            </p>
                            {fish.secret && (
                              <p className="fish-card__secret">
                                {t('secret_requires')}
                              </p>
                            )}
                          </>
                        )}
                      </div>
                    </article>
                  )
                })}
              </div>

              <footer className="fishing-footer">
                <p>{t('fishing_saved_locally')}</p>
                <button
                  type="button"
                  className={`mc-btn mc-btn--small ${
                    confirmReset ? 'mc-btn--danger' : 'mc-btn--ghost'
                  }`}
                  onClick={onResetFishing}
                >
                  {confirmReset
                    ? t('reset_fishing_confirm')
                    : t('reset_fishing')}
                </button>
              </footer>
            </section>
          )}

          {tab === 'rods' && (
            <section className="fishing-section">
              <div className="fishing-section__head">
                <div>
                  <h3>{t('rods')}</h3>
                  <p>{t('rods_sub')}</p>
                </div>
                <span className="fishing-progress-label">
                  {state.rods.length}/{RODS.length}
                </span>
              </div>

              <div className="fishing-rods">
                {RODS.map((rod) => {
                  const unlocked = state.rods.includes(rod.id)
                  const equipped = state.selectedRod === rod.id
                  const requirement = rodRequirementProgress(state, rod)
                  const reqPercent = Math.min(
                    100,
                    (requirement.current / requirement.target) * 100,
                  )
                  return (
                    <article
                      key={rod.id}
                      className={`rod-row${
                        unlocked ? ' rod-row--unlocked' : ' rod-row--locked'
                      }${equipped ? ' rod-row--equipped' : ''}`}
                    >
                      <div className="rod-row__icon">
                        <RodIcon color={rod.color} />
                      </div>
                      <div className="rod-row__body">
                        <div className="rod-row__top">
                          <h4>{pick(rod.name)}</h4>
                          {equipped && (
                            <span className="rod-row__badge">
                              {t('equipped')}
                            </span>
                          )}
                        </div>
                        <p className="rod-row__desc">
                          {pick(rod.description)}
                        </p>
                        <div className="rod-row__stats">
                          <span>
                            {t('bite_window')}:{' '}
                            {(rod.biteWindow / 1000).toFixed(2)}s
                          </span>
                          <span>
                            {t('tension_control')}:{' '}
                            {Math.round(100 - rod.tensionRate)}%
                          </span>
                          <span>
                            {t('luck')}: +{Math.round(rod.luck * 100)}%
                          </span>
                        </div>
                        {!unlocked && rod.requirement && (
                          <div className="rod-row__req">
                            <div className="rod-row__req-top">
                              <span>{pick(rod.unlockText)}</span>
                              <span>
                                {Math.min(
                                  requirement.current,
                                  requirement.target,
                                )}
                                /{requirement.target}
                              </span>
                            </div>
                            <div className="rod-row__bar">
                              <span style={{ width: `${reqPercent}%` }} />
                            </div>
                          </div>
                        )}
                      </div>
                      <div className="rod-row__action">
                        {equipped ? (
                          <span className="rod-row__state">
                            {t('equipped')}
                          </span>
                        ) : unlocked ? (
                          <button
                            type="button"
                            className="mc-btn mc-btn--small"
                            onClick={() => selectRod(rod.id)}
                          >
                            {t('equip')}
                          </button>
                        ) : (
                          <span className="rod-row__state">
                            {t('locked')}
                          </span>
                        )}
                      </div>
                    </article>
                  )
                })}
              </div>
            </section>
          )}
        </div>
      </div>
    </div>
  )
}
