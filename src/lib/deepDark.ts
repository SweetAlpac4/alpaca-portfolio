// An exposed tile flashes one beat before the sensor reaches it. Wool absorbs the pulse.
export const PASSAGE = [
  'S..w###',
  '.##...#',
  'w.###.#',
  '#.##..E',
  '#w..w#.',
  '####w.w',
]
export const WIDTH = PASSAGE[0].length
export const tiles = PASSAGE.join('')
export const ENTRANCE = tiles.indexOf('S')
export const EXIT = tiles.indexOf('E')
export const BEAT_LIMIT = 40
export const BEAT_MS = 750

export function adjacent(a: number, b: number) {
  return Math.abs(a % WIDTH - b % WIDTH) + Math.abs(Math.floor(a / WIDTH) - Math.floor(b / WIDTH)) === 1
}

export function sensor(tile: number, beat: number) {
  if (tiles[tile] !== '.') return 'safe'
  const phase = (beat + tile % WIDTH + 2 * Math.floor(tile / WIDTH)) % 5
  return phase === 0 ? 'pulse' : phase === 4 ? 'warning' : 'quiet'
}

export function toggleRune(mask: number, cell: number) {
  for (let i = 0; i < 9; i++) {
    if (Math.abs(i % 3 - cell % 3) + Math.abs(Math.floor(i / 3) - Math.floor(cell / 3)) <= 1) mask ^= 1 << i
  }
  return mask
}

// Scramble a solved furnace with five distinct moves so reversing them always works.
export function furnacePuzzle(rng = Math.random) {
  const cells = Array.from({ length: 9 }, (_, i) => i)
  let mask = 511
  for (let i = 0; i < 5; i++) {
    const [cell] = cells.splice(Math.floor(rng() * cells.length), 1)
    mask = toggleRune(mask, cell)
  }
  return mask
}
