import { scoreToQuality, type BrewQuality } from './nether.ts'

export const BREW_DURATION = 36000
export const BREW_BEAT = 4000
export const BREW_STEPS = 9
export const SAFE_HEAT = { min: 25, max: 75 }
export const VENT_COOLDOWN = 1600

export type BrewSession = {
  elapsed: number
  heat: number
  safeTime: number
  overheats: number
  overheated: boolean
  lastVent: number
  hits: (number | null)[]
  combo: number
  bestCombo: number
}
export type BrewResult = { score: number; quality: BrewQuality; clean: boolean; hits: number; bestCombo: number; overheats: number }

export function createBrewSession(): BrewSession {
  return { elapsed: 0, heat: 45, safeTime: 0, overheats: 0, overheated: false, lastVent: -VENT_COOLDOWN, hits: Array(BREW_STEPS).fill(null), combo: 0, bestCombo: 0 }
}

export function currentBeat(session: BrewSession) {
  return Math.min(BREW_STEPS - 1, Math.floor(session.elapsed / BREW_BEAT))
}

export function markerPosition(elapsed: number, difficulty: number) {
  const cycle = ((elapsed % BREW_BEAT) / (2600 - difficulty * 260)) % 1
  return (cycle < 0.5 ? cycle * 2 : (1 - cycle) * 2) * 100
}

// A fixed-size integration step makes heat/scoring independent of render frequency.
export function advanceBrew(session: BrewSession, milliseconds: number, difficulty: number): BrewSession {
  const next = { ...session, hits: [...session.hits] }
  let remaining = Math.min(Math.max(0, milliseconds), BREW_DURATION - next.elapsed)
  while (remaining > 0) {
    const dt = Math.min(50, remaining)
    const previousBeat = currentBeat(next)
    next.elapsed += dt
    next.heat = Math.min(100, next.heat + (3 + difficulty * 0.5) * dt / 1000)
    if (next.heat >= SAFE_HEAT.min && next.heat <= SAFE_HEAT.max) next.safeTime += dt
    if (next.heat >= 95 && !next.overheated) { next.overheats++; next.overheated = true }
    if (next.heat < 80) next.overheated = false
    if ((currentBeat(next) !== previousBeat || next.elapsed >= BREW_DURATION) && next.hits[previousBeat] === null) {
      next.hits[previousBeat] = 0
      next.combo = 0
    }
    remaining -= dt
  }
  return next
}

export function tapIngredient(session: BrewSession, difficulty: number): BrewSession {
  const beat = currentBeat(session)
  if (session.elapsed >= BREW_DURATION || session.hits[beat] !== null) return session
  const distance = Math.abs(markerPosition(session.elapsed, difficulty) - 50)
  const precision = distance <= 15 ? Math.round(100 - distance * 1.6) : 0
  const hits = [...session.hits]
  hits[beat] = precision
  const combo = precision > 0 ? session.combo + 1 : 0
  return { ...session, hits, combo, bestCombo: Math.max(session.bestCombo, combo) }
}

export function ventBrew(session: BrewSession): BrewSession {
  if (session.elapsed >= BREW_DURATION || session.elapsed - session.lastVent < VENT_COOLDOWN) return session
  return { ...session, heat: Math.max(0, session.heat - 24), lastVent: session.elapsed, overheated: false }
}

export function finishBrew(session: BrewSession): BrewResult {
  const timing = session.hits.reduce<number>((total, value) => total + (value ?? 0), 0) / BREW_STEPS
  const score = Math.round(Math.max(0, Math.min(100, timing * 0.7 + (session.safeTime / BREW_DURATION) * 30 - session.overheats * 4)))
  const hits = session.hits.filter(value => value !== null && value > 0).length
  return { score, quality: scoreToQuality(score), hits, bestCombo: session.bestCombo, overheats: session.overheats, clean: hits === BREW_STEPS && session.overheats === 0 }
}
