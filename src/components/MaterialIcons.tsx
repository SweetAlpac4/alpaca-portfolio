import type { MaterialId } from '../lib/materials'

type Props = {
  material: MaterialId
  className?: string
}

export function MaterialIcon({ material, className }: Props) {
  return (
    <svg
      viewBox="0 0 16 16"
      className={`material-icon${className ? ` ${className}` : ''}`}
      shapeRendering="crispEdges"
      aria-hidden="true"
      focusable="false"
    >
      {material === 'nether_wart' && (
        <>
          <rect x="6" y="2" width="3" height="3" fill="#8f2434" />
          <rect x="4" y="5" width="3" height="4" fill="#b33545" />
          <rect x="8" y="4" width="3" height="5" fill="#a1293b" />
          <rect x="6" y="8" width="4" height="5" fill="#7c1f2f" />
          <rect x="5" y="6" width="1" height="2" fill="#dc5d65" />
          <rect x="9" y="5" width="1" height="2" fill="#d54e5c" />
          <rect x="7" y="9" width="1" height="2" fill="#c64a56" />
          <rect x="2" y="11" width="2" height="2" fill="#5f1925" />
          <rect x="12" y="10" width="2" height="2" fill="#5f1925" />
        </>
      )}
      {material === 'glowstone_dust' && (
        <>
          <rect x="3" y="10" width="10" height="3" fill="#b88c2d" />
          <rect x="5" y="9" width="6" height="2" fill="#e3b843" />
          <rect x="6" y="7" width="4" height="2" fill="#f7dc78" />
          <rect x="2" y="8" width="2" height="2" fill="#e3b843" />
          <rect x="12" y="7" width="2" height="2" fill="#f7dc78" />
          <rect x="4" y="6" width="2" height="2" fill="#fff3b0" />
          <rect x="10" y="9" width="2" height="2" fill="#fff3b0" />
          <rect x="7" y="4" width="2" height="2" fill="#e3b843" />
        </>
      )}
      {material === 'nether_quartz' && (
        <>
          <path d="M8 1L12 5L10 13L6 15L3 7Z" fill="#8f918d" />
          <path d="M8 2L10 6L9 12L7 13L5 6Z" fill="#d9d5c8" />
          <path d="M8 4L9 6L8 9L7 6Z" fill="#fffdf2" />
          <rect x="4" y="8" width="1" height="3" fill="#b8b5aa" />
          <rect x="11" y="5" width="1" height="2" fill="#b8b5aa" />
        </>
      )}
      {material === 'magma_cream' && (
        <>
          <rect x="5" y="3" width="6" height="3" fill="#a8321e" />
          <rect x="3" y="6" width="10" height="6" fill="#d95426" />
          <rect x="4" y="12" width="8" height="2" fill="#8d2819" />
          <rect x="6" y="5" width="4" height="2" fill="#ff8a3d" />
          <rect x="5" y="8" width="2" height="2" fill="#ffd75e" />
          <rect x="10" y="9" width="1" height="1" fill="#ffe89c" />
          <rect x="8" y="11" width="2" height="1" fill="#ffb347" />
          <rect x="2" y="8" width="2" height="2" fill="#6d2015" />
          <rect x="12" y="7" width="1" height="2" fill="#6d2015" />
        </>
      )}
      {material === 'blaze_powder' && (
        <>
          <rect x="3" y="11" width="10" height="2" fill="#a8321e" />
          <rect x="4" y="9" width="8" height="3" fill="#e35a1c" />
          <rect x="6" y="7" width="5" height="2" fill="#ff9d3d" />
          <rect x="5" y="5" width="2" height="2" fill="#ffd75e" />
          <rect x="10" y="4" width="2" height="2" fill="#ffb347" />
          <rect x="7" y="3" width="2" height="2" fill="#fff3b0" />
          <rect x="2" y="7" width="1" height="2" fill="#ff9d3d" />
          <rect x="12" y="8" width="2" height="1" fill="#ffd75e" />
        </>
      )}
      {material === 'ghast_tear' && (
        <>
          <path d="M8 1L11 7L10 12L8 15L6 12L5 7Z" fill="#3b7d8a" />
          <path d="M8 3L10 7L9 11L8 13L7 11L6 7Z" fill="#b9edf4" />
          <path d="M8 5L9 7L8 10L7 7Z" fill="#e8fbfd" />
          <rect x="4" y="8" width="1" height="2" fill="#7acbd8" />
          <rect x="11" y="6" width="1" height="2" fill="#d9f8fb" />
        </>
      )}
    </svg>
  )
}
