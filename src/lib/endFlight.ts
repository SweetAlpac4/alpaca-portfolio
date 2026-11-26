// Coordinates use the same units as the 400 × 200 flight scene.
export const LEG_LENGTH = 1050
export const FLIGHT_LENGTH = 3 * LEG_LENGTH
export const PILLAR_WIDTH = 28

export const PASSAGES = [
  { x: 230, top: 0, floor: 141 },
  { x: 505, top: 62, floor: 178 },
  { x: 825, top: 0, floor: 105 },
  { x: 1270, top: 44, floor: 140 },
  { x: 1550, top: 84, floor: 172 },
  { x: 1870, top: 0, floor: 91 },
  { x: 2310, top: 73, floor: 157 },
  { x: 2580, top: 0, floor: 95 },
  { x: 2860, top: 91, floor: 178 },
]

export type FlightMode = 'journey' | 'infinity'

export function startFlight(mode: FlightMode = 'journey', seed = 0) {
  return {
    mode, seed, x: 0, y: 87, vy: 0, checkpoint: 0, rescued: 0, recovery: 0, boost: 0,
    gates: 0, rings: 0, crashed: false,
  }
}

export type Flight = ReturnType<typeof startFlight>

const FIRST_GATE = 230
const GATE_SPACING = 212

// Index gates by distance so a long flight only needs the obstacles on screen.
export function passagesFor(flight: Flight) {
  if (flight.mode === 'journey') return PASSAGES
  const first = Math.max(0, Math.ceil((flight.x - 110 - FIRST_GATE) / GATE_SPACING))
  const last = Math.floor((flight.x + 400 - FIRST_GATE) / GATE_SPACING)
  const gates = []
  for (let i = first; i <= last; i++) {
    const hash = Math.imul(i + flight.seed, 0x45d9f3b)
    const offset = ((hash ^ (hash >>> 16)) >>> 0) % 22
    const center = (i + flight.seed) % 2 ? 113 + offset : 65 + offset
    const halfGap = Math.max(20, 38 - Math.floor(i / 2))
    gates.push({ x: FIRST_GATE + i * GATE_SPACING, top: center - halfGap, floor: center + halfGap })
  }
  return gates
}

export function flightScore(flight: Flight) {
  return Math.floor(flight.x) + flight.gates * 200 + flight.rings * 350
}

const BEST_KEY = 'portfolio-end-infinity-best-v1'

export function loadFlightBest() {
  try {
    const best = Number(window.localStorage.getItem(BEST_KEY))
    return Number.isSafeInteger(best) && best > 0 ? best : 0
  } catch {
    return 0
  }
}

export function saveFlightBest(score: number) {
  const best = Math.max(loadFlightBest(), score)
  try { window.localStorage.setItem(BEST_KEY, String(best)) } catch { /* Storage unavailable. */ }
  return best
}

export function fly(s: Flight, dive: boolean, dt: number): Flight {
  const endless = s.mode === 'infinity'
  if (s.crashed || (!endless && s.x >= FLIGHT_LENGTH)) return s
  if (s.recovery > 0) return { ...s, recovery: Math.max(0, s.recovery - dt) }

  const velocity = dive ? 83 : -65
  const vy = s.vy + (velocity - s.vy) * (1 - Math.exp(-4 * dt))
  const y = Math.max(12, Math.min(190, s.y + vy * dt))
  const pace = endless ? Math.min(18, s.gates * .6) : 0
  const speed = (dive ? 76 : 59) + pace + (s.boost > 0 ? 40 : 0)
  const x = Math.min(endless ? Infinity : FLIGHT_LENGTH, s.x + dt * speed)
  let { rings, gates } = s
  let boost = Math.max(0, s.boost - dt)

  for (const gate of passagesFor(s)) {
    if (x + 15 < gate.x || s.x - 11 > gate.x + PILLAR_WIDTH) continue
    if (y + 5 >= gate.floor || y - 5 <= gate.top) {
      if (endless) return { ...s, x, y, vy, crashed: true }
      return { ...startFlight(), x: s.checkpoint, checkpoint: s.checkpoint, rescued: s.rescued + 1, recovery: 1.2 }
    }
    const ringX = gate.x + PILLAR_WIDTH / 2
    if (s.x < ringX && x >= ringX && Math.abs(y - (gate.floor - 20)) <= 11) {
      boost = 2
      rings++
    }
    const exit = gate.x + PILLAR_WIDTH + 11
    if (s.x <= exit && x > exit) gates++
  }

  const checkpoint = Math.min(2, Math.floor(x / LEG_LENGTH)) * LEG_LENGTH
  return { ...s, x, y, vy, boost, checkpoint, gates, rings }
}
