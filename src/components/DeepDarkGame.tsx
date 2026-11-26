import { useEffect, useRef, useState } from 'react'
import { useTouchControls } from '../hooks/useTouchControls'
import { useLang } from '../i18n'
import { ARTIFACTS } from '../lib/achievements'
import { adjacent, BEAT_LIMIT, BEAT_MS, ENTRANCE, EXIT, furnacePuzzle, sensor, tiles, toggleRune, WIDTH } from '../lib/deepDark'
import { useAchievements } from './AchievementProvider'
import { useCave } from './CaveProvider'
import { useFishing } from './FishingProvider'
import { useNether } from './NetherProvider'
import { RodIcon } from './FishingIcons'
import { ROD_BY_ID } from '../lib/fishing'
import '../styles/deepDark.css'

type Journey = { started: boolean; pos: number; beat: number; strikes: number; carrying: boolean; moved: boolean }
const startJourney = (): Journey => ({ started: false, pos: ENTRANCE, beat: 0, strikes: 0, carrying: false, moved: false })

export function DeepDarkGame({ onClose }: { onClose: () => void }) {
  const { lang } = useLang()
  const touch = useTouchControls()
  const say = (en: string, id: string) => lang === 'id' ? id : en
  const { state: fishing, claimShard, forgeRod } = useFishing()
  const { state: cave, spendVoidsteel } = useCave()
  const { state: nether, spendResonance } = useNether()
  const { unlocked } = useAchievements()
  const dialog = useRef<HTMLDialogElement>(null)
  const swipe = useRef<{ x: number; y: number } | null>(null)
  const swiped = useRef(false)
  const board = useRef<HTMLDivElement>(null)
  const [stage, setStage] = useState<'camp' | 'walk' | 'forge'>('camp')
  const [journey, setJourney] = useState(startJourney)
  const [mask, setMask] = useState(0)
  const [moves, setMoves] = useState(0)
  const [failed, setFailed] = useState(false)
  const complete = fishing.rods.includes('warden')
  const artifacts = ARTIFACTS.filter(a => unlocked.has(a.id)).length
  const ready = !complete && fishing.shardFound && artifacts === ARTIFACTS.length && nether.soulFlame && nether.resonance > 0 && cave.ores.voidsteel > 0
  const caught = journey.strikes >= 2 || journey.beat >= BEAT_LIMIT

  useEffect(() => {
    const el = dialog.current!
    el.showModal()
    return () => el.close()
  }, [])

  useEffect(() => {
    if (stage === 'walk' && !journey.started) board.current?.focus()
  }, [stage, journey.started])

  useEffect(() => {
    if (stage !== 'walk' || !journey.started || caught) return
    const timer = window.setInterval(() => {
      if (document.hidden) return
      setJourney(old => ({
        ...old, beat: old.beat + 1, moved: false,
        strikes: old.strikes + Number(sensor(old.pos, old.beat + 1) === 'pulse'),
      }))
    }, BEAT_MS)
    return () => clearInterval(timer)
  }, [stage, journey.started, caught])

  function step(to: number) {
    if (caught || journey.moved || !adjacent(journey.pos, to) || !tiles[to] || tiles[to] === '#') return
    if (to === ENTRANCE && journey.carrying) {
      claimShard()
      setStage('camp')
      return
    }
    setJourney({ ...journey, started: true, pos: to, carrying: journey.carrying || to === EXIT, moved: true, strikes: journey.strikes + Number(sensor(to, journey.beat) === 'pulse') })
  }

  function ignite() {
    if (!ready) return
    setMask(furnacePuzzle())
    setMoves(5)
    setFailed(false)
    setStage('forge')
  }

  function turn(cell: number) {
    if (!ready || failed || moves < 1) return
    const next = toggleRune(mask, cell)
    setMask(next)
    setMoves(moves - 1)
    if (next === 511) {
      forgeRod()
      spendVoidsteel()
      spendResonance()
      setStage('camp')
    } else if (moves === 1) setFailed(true)
  }

  const requirements = [
    [fishing.shardFound, 'Echo Shard · Silent Steps'],
    [cave.ores.voidsteel > 0, say('Voidsteel · Cave row 7 (5%)', 'Voidsteel · Cave baris 7 (5%)')],
    [nether.resonance > 0, say('Potion of Resonance · Nether, after 8 brews', 'Ramuan Resonansi · Nether, setelah 8 racikan')],
    [artifacts === ARTIFACTS.length, say('Artifacts', 'Artefak') + ' · ' + artifacts + '/' + ARTIFACTS.length],
    [nether.soulFlame, say('Enable Soul Flame in Nether · 5 Perfect brews', 'Aktifkan Api Jiwa di Nether · 5 racikan Sempurna')],
  ] as const

  return <dialog ref={dialog} className="deep-game" aria-labelledby="deep-title" onCancel={e => { e.preventDefault(); onClose() }}
    onKeyDown={e => {
      if (stage !== 'walk') return
      const offset: Record<string, number> = { ArrowUp: -WIDTH, ArrowDown: WIDTH, ArrowLeft: -1, ArrowRight: 1 }
      if (e.key in offset) { e.preventDefault(); if (!e.repeat) step(journey.pos + offset[e.key]) }
    }}>
    <header><div><small>Deep Dark</small><h2 id="deep-title">{stage === 'walk' ? 'Silent Steps' : say('Resonance Furnace', 'Tungku Resonansi')}</h2></div>
      <button onClick={onClose} aria-label={say('Close', 'Tutup')}>×</button></header>
    {stage === 'camp' && (complete ? <section><h3 className="deep-rod"><RodIcon rod={ROD_BY_ID.warden} />Warden Rod</h3><p>{say('Forged. Equip your rod at the Overworld lake. The fifth cast calls the Echo Fish until you land it.', 'Berhasil ditempa. Pakai pancingmu di danau Overworld. Mulai lemparan kelima, Ikan Gema terus menggigit sampai berhasil ditarik.')}</p></section> :
      <section><h3 className="deep-rod"><RodIcon rod={ROD_BY_ID.warden} />Warden Rod</h3><ul>{requirements.map(([ok, label]) => <li key={label} data-ready={ok}>{ok ? '✓' : '□'} {label}</li>)}</ul>
        {!fishing.shardFound && <button onClick={() => { setJourney(startJourney()); setStage('walk') }}>Silent Steps ▸</button>}
        <button disabled={!ready} onClick={ignite}>{say('Light furnace with Soul Flame', 'Nyalakan tungku dengan Api Jiwa')}</button></section>)}
    {stage === 'walk' && <section>
      <p>{say('Take ◆ and bring it back to ⚑.', 'Ambil ◆ lalu bawa kembali ke ⚑.')} {touch
        ? say('Swipe the board or tap the next tile to move one step.', 'Usap papan atau ketuk petak sebelah untuk melangkah.')
        : say('Use the arrow keys or click an adjacent tile.', 'Gunakan tombol panah atau klik petak sebelah.')} {say('Amber warns of a red pulse. Wool ▦ shelters you. Two hits wake the Warden.', 'Kuning menandai gelombang merah berikutnya. Wol ▦ melindungimu. Dua kali terkena, Warden bangun.')}</p>
      <div className="deep-meter">{!journey.started && say('First step starts the clock · ', 'Timer mulai saat kamu melangkah · ')}{journey.carrying && '◆ → ⚑ · '}{say('Alarm', 'Alarm')} {journey.strikes}/2 · {Math.max(0, Math.ceil((BEAT_LIMIT - journey.beat) * BEAT_MS / 1000))}s</div>
      <div className="deep-map" ref={board} tabIndex={-1} role="group" aria-label="Silent Steps"
        onTouchStart={event => {
          const finger = event.touches[0]
          swipe.current = event.touches.length === 1 ? { x: finger.clientX, y: finger.clientY } : null
          swiped.current = false
        }}
        onTouchCancel={() => { swipe.current = null }}
        onTouchEnd={event => {
          const from = swipe.current
          swipe.current = null
          if (!from || event.touches.length) return
          const dx = event.changedTouches[0].clientX - from.x
          const dy = event.changedTouches[0].clientY - from.y
          if (Math.max(Math.abs(dx), Math.abs(dy)) < 22) return
          swiped.current = true
          const offset = Math.abs(dx) > Math.abs(dy) ? Math.sign(dx) : Math.sign(dy) * WIDTH
          step(journey.pos + offset)
        }}
        onClickCapture={event => {
          if (swiped.current && event.detail > 0) {
            event.stopPropagation()
            swiped.current = false
          }
        }}>{Array.from(tiles, (tile, i) => {
        const phase = sensor(i, journey.beat)
        const symbol = i === journey.pos ? '●' : tile === 'E' && !journey.carrying ? '◆' : tile === 'S' ? '⚑' : tile === 'w' ? '▦' : phase === 'warning' ? '!' : phase === 'pulse' ? '×' : ''
        return <button key={i} className={'deep-tile ' + phase} data-player={i === journey.pos} data-shard={tile === 'E' && !journey.carrying} data-wall={tile === '#'} disabled={caught || !adjacent(i, journey.pos) || tile === '#'} onClick={() => step(i)}
          aria-label={[(i % WIDTH) + 1, Math.floor(i / WIDTH) + 1, tile, phase].join(' ')}>{symbol}</button>
      })}</div>
      {caught && <p role="status">{say('Passage lost.', 'Lorong tertutup.')} <button onClick={() => setJourney(startJourney())}>{say('Try again', 'Coba lagi')}</button></p>}
    </section>}
    {stage === 'forge' && <section><p>{say('Light every rune in five moves. Each tap flips that rune and its four neighbors. Ingredients are spent only when the rod is forged.', 'Nyalakan semua rune dalam lima langkah. Tiap ketukan membalik rune itu dan tetangga atas, bawah, kiri, kanan. Bahan dipakai setelah pancing berhasil ditempa.')}</p>
      <div className="deep-meter">{say('Moves left', 'Sisa langkah')} · {moves}</div>
      <div className="deep-runes">{Array.from({ length: 9 }, (_, i) => <button key={i} aria-label={'Rune ' + (i + 1)} aria-pressed={!!(mask & 1 << i)} disabled={failed} onClick={() => turn(i)}>{mask & 1 << i ? '◆' : '◇'}</button>)}</div>
      {failed && <button onClick={ignite}>{say('Retry with the same ingredients', 'Ulangi dengan bahan yang sama')}</button>}
    </section>}
  </dialog>
}
