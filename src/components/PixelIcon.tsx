import type { PixelIconName } from '../lib/achievements'

type Props = {
  name: PixelIconName
  className?: string
}

export function PixelIcon({ name, className }: Props) {
  return (
    <svg
      viewBox="0 0 16 16"
      className={className}
      shapeRendering="crispEdges"
      aria-hidden="true"
      focusable="false"
    >
      {name === 'book' && (
        <>
          <rect x="2" y="1" width="12" height="14" fill="#3b2416" />
          <rect x="3" y="2" width="10" height="12" fill="#7a4a26" />
          <rect x="4" y="3" width="8" height="10" fill="#e6d7b4" />
          <rect x="4" y="3" width="1" height="10" fill="#c9b88f" />
          <rect x="12" y="3" width="1" height="10" fill="#5a3520" />
          <rect x="6" y="4" width="5" height="1" fill="#9a855f" />
          <rect x="6" y="6" width="4" height="1" fill="#9a855f" />
          <rect x="6" y="8" width="5" height="1" fill="#9a855f" />
          <rect x="6" y="10" width="3" height="1" fill="#9a855f" />
          <rect x="11" y="4" width="1" height="1" fill="#ffd75e" />
        </>
      )}
      {name === 'chest' && (
        <>
          <rect x="2" y="5" width="12" height="9" fill="#7b4b26" />
          <rect x="1" y="3" width="14" height="3" fill="#9b6332" />
          <rect x="2" y="6" width="12" height="2" fill="#5a3419" />
          <rect x="7" y="7" width="2" height="5" fill="#e5b84b" />
          <rect x="7" y="9" width="1" height="1" fill="#3b2414" />
          <rect x="3" y="4" width="1" height="1" fill="#c98b4d" />
          <rect x="12" y="4" width="1" height="1" fill="#c98b4d" />
          <rect x="3" y="12" width="1" height="1" fill="#5a3419" />
          <rect x="12" y="12" width="1" height="1" fill="#5a3419" />
        </>
      )}
      {name === 'diamond' && (
        <>
          <path d="M8 1L12 5L8 15L4 5Z" fill="#1d8e8a" />
          <path d="M8 2L10 5L8 12L6 5Z" fill="#8ff7ef" />
          <path d="M5 5H11L8 8Z" fill="#d9fffc" />
          <rect x="4" y="4" width="1" height="1" fill="#4fd6c9" />
          <rect x="11" y="9" width="1" height="1" fill="#4fd6c9" />
        </>
      )}
      {name === 'sculk' && (
        <>
          <rect x="1" y="13" width="14" height="2" fill="#071f21" />
          <rect x="3" y="11" width="10" height="2" fill="#0e3a3c" />
          <rect x="4" y="7" width="8" height="4" fill="#145a5c" />
          <rect x="6" y="4" width="4" height="3" fill="#1c7779" />
          <rect x="5" y="9" width="2" height="2" fill="#6ff5e8" />
          <rect x="9" y="9" width="2" height="2" fill="#6ff5e8" />
          <rect x="7" y="5" width="1" height="1" fill="#b5fff9" />
          <rect x="2" y="10" width="2" height="1" fill="#1c7779" />
          <rect x="12" y="10" width="2" height="1" fill="#1c7779" />
        </>
      )}
      {name === 'blaze' && (
        <>
          <rect x="6" y="1" width="4" height="2" fill="#ffd75e" />
          <rect x="5" y="3" width="6" height="3" fill="#ff9d3d" />
          <rect x="3" y="6" width="10" height="7" fill="#e35a1c" />
          <rect x="5" y="8" width="6" height="5" fill="#ffb347" />
          <rect x="6" y="9" width="4" height="2" fill="#fff3b0" />
          <rect x="2" y="8" width="2" height="2" fill="#ff7a3d" />
          <rect x="12" y="8" width="2" height="2" fill="#ff7a3d" />
          <rect x="4" y="12" width="2" height="2" fill="#b7360d" />
          <rect x="10" y="12" width="2" height="2" fill="#b7360d" />
        </>
      )}
      {name === 'pearl' && (
        <>
          <rect x="6" y="1" width="4" height="2" fill="#2e1a4a" />
          <rect x="4" y="3" width="8" height="2" fill="#2e1a4a" />
          <rect x="3" y="5" width="10" height="6" fill="#2e1a4a" />
          <rect x="4" y="11" width="8" height="2" fill="#2e1a4a" />
          <rect x="6" y="13" width="4" height="2" fill="#2e1a4a" />
          <rect x="5" y="4" width="6" height="8" fill="#6d4bb5" />
          <rect x="6" y="3" width="4" height="10" fill="#6d4bb5" />
          <rect x="6" y="5" width="3" height="4" fill="#b79cff" />
          <rect x="7" y="5" width="2" height="2" fill="#e5dcff" />
          <rect x="9" y="9" width="2" height="2" fill="#4a2e8a" />
        </>
      )}
      {name === 'star' && (
        <>
          <path
            d="M8 1L9.5 5.5H14L10.5 8.2L12 13L8 10.2L4 13L5.5 8.2L2 5.5H6.5Z"
            fill="#fff3b0"
          />
          <path
            d="M8 3L8.8 6H11.5L9.3 7.5L10.1 10.5L8 8.8L5.9 10.5L6.7 7.5L4.5 6H7.2Z"
            fill="#ffd75e"
          />
          <rect x="7" y="7" width="2" height="2" fill="#fff" />
        </>
      )}
      {name === 'trophy' && (
        <>
          <rect x="3" y="2" width="10" height="2" fill="#ffd75e" />
          <rect x="2" y="4" width="2" height="4" fill="#e0a92e" />
          <rect x="12" y="4" width="2" height="4" fill="#e0a92e" />
          <rect x="4" y="4" width="8" height="4" fill="#ffd75e" />
          <rect x="6" y="6" width="2" height="1" fill="#fff3b0" />
          <rect x="6" y="8" width="4" height="2" fill="#c99422" />
          <rect x="5" y="10" width="6" height="2" fill="#8f6718" />
          <rect x="4" y="12" width="8" height="2" fill="#5c3f0d" />
        </>
      )}
    </svg>
  )
}
