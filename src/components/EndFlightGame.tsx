import { useTouchControls } from '../hooks/useTouchControls'
import { useEffect, useRef, useState, type ButtonHTMLAttributes } from 'react'
import { useLang } from '../i18n'
import { fly, flightScore, FLIGHT_LENGTH, LEG_LENGTH, loadFlightBest, saveFlightBest, startFlight, type FlightMode } from '../lib/endFlight'
import { ROD_BY_ID } from '../lib/fishing'
import { useAchievements } from './AchievementProvider'
import { DragonFarewell, EndFlightScene } from './EndFlightScene'
import { useFishing } from './FishingProvider'
import { FishingScene } from './FishingScene'
import { PixelIcon } from './PixelIcon'
import '../styles/endFlight.css'

export function EndFlightGame({ onClose, onHome }: { onClose: () => void, onHome: () => void }) {
  const { t, lang } = useLang()
  const touch = useTouchControls()
  const guide = t(touch ? 'flight_touch_guide' : 'flight_guide')
  const { state, selectedRod } = useFishing()
  const { unlock } = useAchievements()
  const panel = useRef<HTMLDialogElement>(null)
  const sky = useRef<HTMLButtonElement>(null)
  const holding = useRef(false)
  const [phase, setPhase] = useState<'ready' | 'flying' | 'landed' | 'crashed'>('ready')
  const [mode, setMode] = useState<FlightMode>('journey')
  const [best, setBest] = useState(loadFlightBest)
  const launch = useRef(startFlight())
  const [flight, setFlight] = useState(launch.current)
  const endless = mode === 'infinity'
  const score = flightScore(flight)
  const landed = phase === 'landed'

  useEffect(() => {
    const dialog = panel.current
    dialog?.showModal()
    dialog?.querySelector<HTMLButtonElement>('.end-flight__action')?.focus()
    return () => dialog?.close()
  }, [])

  useEffect(() => {
    if (phase !== 'flying') return
    sky.current?.focus({ preventScroll: true })
    let current = launch.current
    let previous = performance.now()
    let frame = 0

    function resetInput() {
      holding.current = false
      previous = performance.now()
    }
    function draw(now: number) {
      if (!document.hidden && document.hasFocus()) {
        current = fly(current, holding.current, Math.min(.05, Math.max(0, now - previous) / 1000))
        setFlight(current)
        if (current.crashed) {
          const record = saveFlightBest(flightScore(current))
          setBest(previous => Math.max(previous, record))
          setPhase('crashed')
          return
        }
        if (current.mode === 'journey' && current.x >= FLIGHT_LENGTH) {
          holding.current = false
          unlock('end_dragon_scale')
          setPhase('landed')
          return
        }
      }
      previous = now
      frame = requestAnimationFrame(draw)
    }
    document.addEventListener('visibilitychange', resetInput)
    window.addEventListener('blur', resetInput)
    frame = requestAnimationFrame(draw)
    return () => {
      cancelAnimationFrame(frame)
      if (current.mode === 'infinity' && !current.crashed && current.x > 0) {
        saveFlightBest(flightScore(current))
      }
      document.removeEventListener('visibilitychange', resetInput)
      window.removeEventListener('blur', resetInput)
      holding.current = false
    }
  }, [phase, unlock])

  function start() {
    launch.current = startFlight(mode, endless ? Math.floor(Math.random() * 0x1000000) : 0)
    setFlight(launch.current)
    setPhase('flying')
  }

  const release = () => { holding.current = false }
  const flightControls: ButtonHTMLAttributes<HTMLButtonElement> = {
    onPointerDown: event => {
      if (!event.isPrimary || event.button !== 0) return
      event.preventDefault()
      event.currentTarget.setPointerCapture(event.pointerId)
      holding.current = true
    },
    onLostPointerCapture: release,
    onPointerCancel: release,
    onPointerUp: event => { if (event.isPrimary) release() },
    onBlur: release,
    onKeyDown: event => {
      if (event.code === 'Space') { event.preventDefault(); holding.current = true }
    },
    onKeyUp: event => {
      if (event.code === 'Space') { event.preventDefault(); release() }
    },
  }

  const checkpoint = flight.checkpoint / LEG_LENGTH
  // The first approach lasts about three seconds. A rescue can rewind x to zero.
  const showGuide = flight.x < 180 && flight.rescued === 0
  const notice = flight.recovery > 0 ? t('flight_rescue') : flight.boost > 0 ? t('flight_boost') : ''
  return <dialog ref={panel} className="end-flight" aria-labelledby="flight-title" onCancel={e => { e.preventDefault(); onClose() }}>
    <header>
      <div><small>{landed ? 'Overworld' : 'The End'}</small><h2 id="flight-title">{t(landed ? 'flight_landed' : endless && phase !== 'ready' ? 'flight_infinity' : 'flight_title')}</h2></div>
      <button type="button" className="end-flight__close" aria-label={t('close')} onClick={onClose}>×</button>
    </header>
    {phase === 'flying' ? <button ref={sky} type="button" className="end-flight__sky" aria-label={guide} {...flightControls}>
      <EndFlightScene flight={flight} />
    </button> : <div className="end-flight__sky">
      {landed ? <>
        <FishingScene phase="idle" timePhase="dawn" progress={0} holding={false} rod={state.rods.includes('warden') ? ROD_BY_ID.warden : selectedRod} />
        <DragonFarewell />
        <PixelIcon className="end-flight__keepsake" name="scale" />
      </> : <EndFlightScene flight={phase === 'ready' ? startFlight(mode) : flight} crystal={phase === 'ready'} />}
    </div>}
    <footer>
      {phase === 'ready' && <div className="end-flight__modes" role="group" aria-label={t('flight_mode')}>
        {(['journey', 'infinity'] as const).map(option =>
          <button key={option} type="button" aria-pressed={mode === option} onClick={() => setMode(option)}>
            {t(option === 'journey' ? 'flight_journey' : 'flight_infinity')}
          </button>
        )}
      </div>}
      {endless && phase !== 'ready' && <div className="end-flight__score">
        <span>{t('cave_score')} <strong>{score.toLocaleString(lang)}</strong></span>
        <span>{t('cave_best')} <b>{Math.max(best, score).toLocaleString(lang)}</b></span>
      </div>}
      {phase === 'flying' && !endless && <div className="end-flight__progress">
        <span>{t('flight_leg')} {checkpoint}/2</span>
        <progress aria-label={t('flight_title')} max={FLIGHT_LENGTH} value={flight.x} />
        <span>{Math.floor(flight.x / FLIGHT_LENGTH * 100)}%</span>
      </div>}
      {phase === 'flying' ? <div className="end-flight__messages">
        <p style={{ visibility: showGuide ? 'visible' : 'hidden' }}>{guide}</p>
        <p role="status">{notice}</p>
      </div> : phase === 'crashed' ? <>
        <p role="status">{t('flight_crash')} · {t('flight_gates')} {flight.gates} · {t('flight_rings')} {flight.rings}</p>
        <div className="end-flight__actions">
          <button type="button" className="end-flight__action" autoFocus onClick={start}>{t('flight_replay')}</button>
          <button type="button" onClick={() => setPhase('ready')}>{t('flight_mode')}</button>
        </div>
      </> : <p aria-live="polite">{t(landed ? 'flight_keepsake' : endless ? 'flight_infinity_rules' : 'flight_intro')}</p>}
      {phase === 'ready' && <><p>{guide}</p><button type="button" className="end-flight__action" onClick={start}>{t(endless ? 'flight_infinity_start' : 'flight_light')}</button></>}
      {landed && <div className="end-flight__actions"><button type="button" className="end-flight__action" autoFocus onClick={onHome}><PixelIcon name="scale" />{t('flight_home')}</button><button type="button" onClick={start}>{t('flight_replay')}</button></div>}
      {touch && phase === 'flying' && <button type="button" className="end-flight__dive" {...flightControls}>{t('flight_dive')}</button>}
    </footer>
  </dialog>
}
