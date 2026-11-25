// Sculk tendrils frame a dark, eyeless mask over the ribbed soul chamber.
// Both the inventory icon and the rod on the lake use this pixel pattern.
const sprite = [
  '.g............g.',
  'ga............ag',
  '.ta..b....b..at.',
  '..tt.bnnnnb.tt..',
  '...ttnttttntt...',
  '....nnnnnnnn....',
  '....ntnnnntn....',
  '.....nnbbnn.....',
  '....nbbttbbn....',
  '....nbtggtbn....',
  '.....nbggbn.....',
  '.....nbttbn.....',
  '......nbbn......',
]
const colors: Record<string, string> = {
  n: '#0b202b', t: '#175054', a: '#4bafaa',
  g: '#8dffde', b: '#c4c8a5',
}

export const wardenReel = sprite.flatMap((row, y) =>
  Array.from(row.matchAll(/([^\.])\1*/g), match => ({
    x: match.index!, y, width: match[0].length, fill: colors[match[1]],
  })),
)
