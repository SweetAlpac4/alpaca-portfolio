import type { OreId, PickaxeTier } from '../lib/cave'

const ORE_COLORS: Record<OreId, string> = {
  voidsteel: '#ceabff', coal: '#24272a', iron: '#c5b9a7', gold: '#f3c84f', redstone: '#c83b35', lapis: '#3577c8', diamond: '#67e3dc',
}
export function OreIcon({ ore, className }: { ore: OreId; className?: string }) {
  const color = ORE_COLORS[ore]
  return <svg viewBox="0 0 16 16" className={className} shapeRendering="crispEdges" aria-hidden="true" focusable="false">
    <rect x="1" y="1" width="14" height="14" fill="#343b3d" />
    <path d="M2 2h12v3H2zM3 10h9v4H3z" fill="#555d5c" />
    <path d="M2 7h5v2H2zM10 5h4v2h-4z" fill="#717874" />
    {ore === 'voidsteel' && <path d="M9 2h3L9 7h4L5 15l2-6H4z" fill={color}/>}
    {ore === 'coal' && <><path d="M5 4h4v2H5zM3 8h4v4H3zM10 9h3v3h-3z" fill={color}/><rect x="5" y="8" width="1" height="1" fill="#858b87"/></>}
    {ore === 'iron' && <><path d="M3 4h4v3H3zM9 7h4v3H9zM5 10h4v3H5z" fill={color}/><rect x="4" y="4" width="2" height="1" fill="#f2e1c8"/></>}
    {ore === 'gold' && <><path d="M4 3h5v3H4zM9 8h4v4H9zM3 10h4v3H3z" fill={color}/><path d="M5 3h2v1H5zM10 8h2v1h-2z" fill="#fff1a3"/></>}
    {ore === 'redstone' && <><path d="M4 3h3v3H4zM9 4h4v2H9zM5 9h6v3H5z" fill={color}/><path d="M5 4h1v1H5zM7 9h2v1H7z" fill="#f47d67"/></>}
    {ore === 'lapis' && <><path d="M3 4h5v3H3zM9 8h4v4H9zM4 11h3v2H4z" fill={color}/><path d="M4 4h2v1H4zM10 8h2v1h-2z" fill="#81b4ff"/></>}
    {ore === 'diamond' && <><path d="M4 3h5v4H4zM9 8h4v4H9zM3 11h4v2H3z" fill={color}/><path d="M5 3h2v2H5zM10 8h2v2h-2z" fill="#e4fff5"/></>}
  </svg>
}

const PICKAXE_METALS = {
  wood:    { edge: '#53351f', face: '#aa703d', light: '#dba05c' },
  stone:   { edge: '#45494c', face: '#929794', light: '#c3c7bb' },
  iron:    { edge: '#586369', face: '#c3cbd0', light: '#f5f4e9' },
  diamond: { edge: '#125354', face: '#21b7ad', light: '#8ffbe5' },
} satisfies Record<PickaxeTier, { edge: string; face: string; light: string }>

// A 16px inventory sprite. The head curves across the haft, with one tine
// pointing left and the other down. The exposed wooden pin sits above the joint.
const pickaxeSprite = [
  '................',
  '....eeee....oo..',
  '..eemllmee.owo..',
  '.emmmmmmmeowo...',
  'eeeeeeemmmeo....',
  '.......emlme....',
  '........emlme...',
  '.......owoeme...',
  '......owwo.eme..',
  '.....owwo..eme..',
  '....owwo....eme.',
  '...owwo.....eme.',
  '..owwo......eme.',
  '.owwo.......ee..',
  '.owo........e...',
  '..o.............',
]

// Combine squares of the same shade into one SVG path, including on locked cells.
const spritePaths = Object.entries(pickaxeSprite.reduce<Record<string, string>>((paths, row, y) => {
  Array.from(row).forEach((shade, x) => {
    if (shade !== '.') paths[shade] = (paths[shade] ?? '') + `M${x} ${y}h1v1h-1z`
  })
  return paths
}, {}))

export function PickaxeIcon({ tier, className }: { tier: PickaxeTier; className?: string }) {
  const material = PICKAXE_METALS[tier]
  const palette: Record<string, string> = {
    e: material.edge, m: material.face, l: material.light,
    o: '#50331e', w: '#b78349',
  }
  return (
    <svg viewBox="0 0 16 16" className={className} shapeRendering="crispEdges" aria-hidden="true" focusable="false">
      {spritePaths.map(([shade, path]) => <path key={shade} d={path} fill={palette[shade]} />)}
    </svg>
  )
}
