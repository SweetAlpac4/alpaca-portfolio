import type { OreId, PickaxeTier } from '../lib/cave'

const ORE_COLORS: Record<OreId, string> = {
  coal: '#24272a', iron: '#c5b9a7', gold: '#f3c84f', redstone: '#c83b35', lapis: '#3577c8', diamond: '#67e3dc',
}
export function OreIcon({ ore, className }: { ore: OreId; className?: string }) {
  const color = ORE_COLORS[ore]
  return <svg viewBox="0 0 16 16" className={className} shapeRendering="crispEdges" aria-hidden="true" focusable="false">
    <rect x="1" y="1" width="14" height="14" fill="#343b3d" />
    <path d="M2 2h12v3H2zM3 10h9v4H3z" fill="#555d5c" />
    <path d="M2 7h5v2H2zM10 5h4v2h-4z" fill="#717874" />
    {ore === 'coal' && <><path d="M5 4h4v2H5zM3 8h4v4H3zM10 9h3v3h-3z" fill={color}/><rect x="5" y="8" width="1" height="1" fill="#858b87"/></>}
    {ore === 'iron' && <><path d="M3 4h4v3H3zM9 7h4v3H9zM5 10h4v3H5z" fill={color}/><rect x="4" y="4" width="2" height="1" fill="#f2e1c8"/></>}
    {ore === 'gold' && <><path d="M4 3h5v3H4zM9 8h4v4H9zM3 10h4v3H3z" fill={color}/><path d="M5 3h2v1H5zM10 8h2v1h-2z" fill="#fff1a3"/></>}
    {ore === 'redstone' && <><path d="M4 3h3v3H4zM9 4h4v2H9zM5 9h6v3H5z" fill={color}/><path d="M5 4h1v1H5zM7 9h2v1H7z" fill="#f47d67"/></>}
    {ore === 'lapis' && <><path d="M3 4h5v3H3zM9 8h4v4H9zM4 11h3v2H4z" fill={color}/><path d="M4 4h2v1H4zM10 8h2v1h-2z" fill="#81b4ff"/></>}
    {ore === 'diamond' && <><path d="M4 3h5v4H4zM9 8h4v4H9zM3 11h4v2H3z" fill={color}/><path d="M5 3h2v2H5zM10 8h2v2h-2z" fill="#e4fff5"/></>}
  </svg>
}
export function PickaxeIcon({ tier, className }: { tier: PickaxeTier; className?: string }) {
  const color: Record<PickaxeTier, string> = { wood: '#94612f', stone: '#a9b1ad', iron: '#e0e1d8', diamond: '#67dcd4' }
  const highlight: Record<PickaxeTier, string> = { wood: '#c28a4b', stone: '#d5d8cb', iron: '#fff9e9', diamond: '#c4fff2' }
  return <svg viewBox="0 0 24 24" className={className} shapeRendering="crispEdges" aria-hidden="true" focusable="false">
    <path d="M14 7h4v4h-2v2h-2v2h-2v2h-2v2H8v2H5v-3h2v-2h2v-2h2v-2h2v-2h1z" fill="#2b241e" />
    <path d="M14 9h2v2h-2v2h-2v2h-2v2H8v2H6v-2h2v-2h2v-2h2v-2h2z" fill="#966039" />
    <path d="M11 14h2v2h-2zM8 17h2v2H8z" fill="#c48a50" />
    <path d="M2 10V7h2V5h3V4h10v1h3v2h2v3h-3V9h-3v3h-3V8H9v2H6v2H3v-2z" fill="#202527" />
    <path d="M3 8h2V6h3V5h9v1h3v2h-3V7h-2v3h-1V7H9v1H7v2H5v1H4V9H3z" fill={color[tier]} />
    <path d="M5 7h3V6h8v1H8v1H5z" fill={highlight[tier]} />
    <path d="M18 7h2v1h-2zM4 8h1v2H4z" fill={highlight[tier]} />
  </svg>
}
