import { wardenReel } from './wardenReel'
import type { FishId, RodDef } from '../lib/fishing'

type FishIconProps = {
  species: FishId
  className?: string
}

export function FishIcon({ species, className }: FishIconProps) {
  return (
    <svg
      viewBox="0 0 16 16"
      className={`fish-icon${className ? ` ${className}` : ''}`}
      shapeRendering="crispEdges"
      aria-hidden="true"
      focusable="false"
    >
      {species === 'old_boot' && (
        <>
          <rect x="5" y="2" width="5" height="8" fill="#6b4426" />
          <rect x="6" y="3" width="2" height="1" fill="#8c5c35" />
          <rect x="4" y="10" width="8" height="3" fill="#4a2c18" />
          <rect x="3" y="12" width="10" height="2" fill="#2e1a0e" />
          <rect x="7" y="8" width="1" height="2" fill="#3b2416" />
        </>
      )}
      {species === 'kelp' && (
        <>
          <rect x="4" y="2" width="2" height="11" fill="#2f7a3a" />
          <rect x="7" y="4" width="2" height="10" fill="#4f9e4a" />
          <rect x="10" y="2" width="2" height="12" fill="#2f7a3a" />
          <rect x="3" y="5" width="3" height="1" fill="#6fbf5a" />
          <rect x="9" y="8" width="3" height="1" fill="#6fbf5a" />
          <rect x="6" y="12" width="3" height="1" fill="#1f5a2a" />
        </>
      )}
      {species === 'cod' && (
        <>
          <path d="M2 8L0 5V11L2 8Z" fill="#5a7c8c" />
          <path d="M2 8C4 5 9 4 13 8C9 12 4 11 2 8Z" fill="#7fa6b5" />
          <path d="M4 9C6 10 9 10 11 9L10 11H5L4 9Z" fill="#c6d9dd" />
          <rect x="10" y="6" width="1" height="1" fill="#1f2a30" />
          <rect x="3" y="6" width="2" height="1" fill="#5a7c8c" />
        </>
      )}
      {species === 'salmon' && (
        <>
          <path d="M2 8L0 5V11L2 8Z" fill="#a34a2a" />
          <path d="M2 8C4 5 9 4 13 8C9 12 4 11 2 8Z" fill="#d76b3f" />
          <path d="M4 9C6 10 9 10 11 9L10 11H5L4 9Z" fill="#f0b59a" />
          <rect x="10" y="6" width="1" height="1" fill="#2a1610" />
          <rect x="6" y="5" width="3" height="1" fill="#f08a5a" />
        </>
      )}
      {species === 'tropical_fish' && (
        <>
          <path d="M3 8L0 5V11L3 8Z" fill="#2f7ec9" />
          <path d="M3 8C5 5 9 4 13 8C9 12 5 11 3 8Z" fill="#ffd75e" />
          <rect x="6" y="5" width="2" height="6" fill="#e39d2f" />
          <rect x="10" y="6" width="1" height="1" fill="#2a1a0a" />
          <rect x="4" y="9" width="2" height="1" fill="#4fd6c9" />
        </>
      )}
      {species === 'pufferfish' && (
        <>
          <rect x="5" y="3" width="6" height="10" fill="#d9b44a" />
          <rect x="3" y="5" width="10" height="6" fill="#e3c45a" />
          <rect x="5" y="2" width="1" height="2" fill="#8c6a1e" />
          <rect x="8" y="1" width="1" height="3" fill="#8c6a1e" />
          <rect x="11" y="3" width="1" height="2" fill="#8c6a1e" />
          <rect x="2" y="7" width="2" height="1" fill="#8c6a1e" />
          <rect x="4" y="12" width="1" height="2" fill="#8c6a1e" />
          <rect x="9" y="12" width="1" height="2" fill="#8c6a1e" />
          <rect x="11" y="9" width="2" height="2" fill="#a8842c" />
          <rect x="9" y="5" width="1" height="1" fill="#2a1a0a" />
          <rect x="6" y="8" width="3" height="1" fill="#a8842c" />
        </>
      )}
      {species === 'nautilus_shell' && (
        <>
          <rect x="3" y="4" width="9" height="8" fill="#e8d9bd" />
          <rect x="5" y="2" width="5" height="2" fill="#f1e5ce" />
          <rect x="11" y="5" width="2" height="6" fill="#c9b48e" />
          <rect x="5" y="5" width="6" height="2" fill="#b78a5a" />
          <rect x="7" y="7" width="4" height="2" fill="#8f5e36" />
          <rect x="8" y="9" width="3" height="1" fill="#b78a5a" />
          <rect x="9" y="10" width="2" height="1" fill="#8f5e36" />
          <rect x="3" y="10" width="2" height="2" fill="#c9b48e" />
        </>
      )}
      {species === 'enchanted_book' && (
        <>
          <rect x="3" y="2" width="10" height="12" fill="#3b245c" />
          <rect x="4" y="3" width="8" height="10" fill="#6d4bb5" />
          <rect x="5" y="4" width="6" height="8" fill="#c9b8ff" />
          <rect x="6" y="5" width="4" height="1" fill="#8f6ccf" />
          <rect x="6" y="7" width="3" height="1" fill="#8f6ccf" />
          <rect x="6" y="9" width="4" height="1" fill="#8f6ccf" />
          <rect x="7" y="10" width="2" height="1" fill="#ffd75e" />
          <rect x="11" y="4" width="1" height="2" fill="#4fd6c9" />
        </>
      )}
      {species === 'name_tag' && (
        <>
          <rect x="4" y="5" width="9" height="6" fill="#e0c98f" />
          <rect x="3" y="6" width="1" height="1" fill="#a88a52" />
          <rect x="6" y="3" width="1" height="3" fill="#8f6a3f" />
          <rect x="9" y="3" width="1" height="3" fill="#8f6a3f" />
          <rect x="6" y="7" width="5" height="1" fill="#a88a52" />
          <rect x="6" y="9" width="3" height="1" fill="#a88a52" />
          <rect x="12" y="6" width="2" height="1" fill="#c9a85f" />
        </>
      )}
      {species === 'prismarine_shard' && (
        <>
          <path d="M8 1L13 7L9 15H5L2 8Z" fill="#1f8e8a" />
          <path d="M8 3L10 7L8 12L6 7Z" fill="#7df3e9" />
          <rect x="8" y="4" width="2" height="3" fill="#d9fffc" />
          <rect x="4" y="9" width="2" height="2" fill="#4fd6c9" />
        </>
      )}
      {species === 'heart_of_the_sea' && (
        <>
          <path d="M8 14L2 8C0 5 3 2 6 4L8 6L10 4C13 2 16 5 14 8L8 14Z" fill="#2f7ec9" />
          <path d="M8 11L4 7C3 5 4 4 6 5L8 7L10 5C12 4 13 5 12 7L8 11Z" fill="#4fd6c9" />
          <rect x="6" y="5" width="2" height="2" fill="#d9fffc" />
          <rect x="9" y="8" width="2" height="1" fill="#1f5a8a" />
        </>
      )}
      {species === 'ancient_scale' && (
        <>
          <path d="M8 1L14 5V11L8 15L2 11V5Z" fill="#4f7a2a" />
          <path d="M8 3L12 6V10L8 13L4 10V6Z" fill="#8fbf4a" />
          <path d="M8 5L10 7V9L8 11L6 9V7Z" fill="#e5d27a" />
          <rect x="7" y="7" width="2" height="2" fill="#2f4a1a" />
        </>
      )}
      {species === 'echo_fish' && (
        <>
          <path d="M2 8L0 5V11L2 8Z" fill="#071f21" />
          <path d="M2 8C4 4 10 4 14 8C10 12 4 12 2 8Z" fill="#0e3a3c" />
          <path d="M4 9C6 10 10 10 12 9L11 11H5L4 9Z" fill="#145a5c" />
          <rect x="10" y="6" width="2" height="2" fill="#6ff5e8" />
          <rect x="6" y="5" width="4" height="1" fill="#1c7779" />
          <rect x="7" y="7" width="1" height="1" fill="#b5fff9" />
          <rect x="12" y="5" width="1" height="1" fill="#6ff5e8" />
        </>
      )}
    </svg>
  )
}

type RodIconProps = {
  rod: Pick<RodDef, 'id' | 'color'>
  className?: string
}

export function RodIcon({ rod, className }: RodIconProps) {
  if (rod.id === 'warden') {
    return <svg viewBox="0 0 32 32" className={`rod-icon ${className ?? ''}`} shapeRendering="crispEdges" aria-hidden="true" focusable="false">
      <path d="M23 4Q31 6 27 22" fill="none" stroke="#9dcac5" strokeWidth="1"/>
      <path d="M3 28L14 14 18 6 22 2H26V5H23L21 8 17 16 6 30H3Z" fill="#102430"/>
      <path d="M5 27L15 14 19 6 22 3H25V4H23L20 7 17 15 6 28Z" fill="#397e7c"/>
      <path d="M18 8h3v2h-3zM3 27h3v2H3z" fill="#c4c8a5"/>
      <g transform="translate(4 10)">{wardenReel.map(pixel =>
        <rect key={pixel.y * 16 + pixel.x} {...pixel} height="1"/>)}</g>
      <path d="M27 19h2v3h1v3h-2v2h-2v-3h-1v-3h2z" fill="#12363d"/>
      <path d="M27 21h2v3h-2z" fill="#8dffde"/>
    </svg>
  }
  const color = rod.color
  return (
    <svg
      viewBox="0 0 16 16"
      className={`rod-icon${className ? ` ${className}` : ''}`}
      shapeRendering="crispEdges"
      aria-hidden="true"
      focusable="false"
    >
      <path d="M3 13L13 2" stroke={color} strokeWidth="2" />
      <rect x="2" y="12" width="3" height="3" fill="#5b3a22" />
      <rect x="2" y="12" width="1" height="1" fill="#9a6332" />
      <path
        d="M13 2C15 5 15 9 13 14"
        stroke="#d9d9d9"
        strokeWidth="0.7"
        fill="none"
      />
      <rect x="12" y="13" width="2" height="2" fill="#ffd75e" />
      <rect x="12" y="13" width="1" height="1" fill="#fff3b0" />
    </svg>
  )
}
