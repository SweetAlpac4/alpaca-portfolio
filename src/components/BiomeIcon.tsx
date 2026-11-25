import type { SectionId } from '../data/sections'

export function BiomeIcon({ name, className }: { name: SectionId; className?: string }) {
  return <svg className={className} viewBox="0 0 24 24" shapeRendering="crispEdges" aria-hidden="true" focusable="false">
    {name === 'overworld' && <>
      <path d="M3 7h18v13H3z" fill="#392b20" /><path d="M4 10h16v9H4z" fill="#765034" />
      <path d="M3 5h18v5H3z" fill="#397b3b" /><path d="M5 4h13v2H5z" fill="#81c758" />
      <path d="M6 10h2v2H6zM12 11h3v2h-3zM17 15h2v2h-2z" fill="#a77749" />
      <path d="M8 3h2V1h1v4H8z" fill="#4c9c48" /><path d="M9 3h1v2H9z" fill="#d6e87a" />
    </>}
    {name === 'cave' && <>
      <path d="M2 20V9h2V6h3V4h10v2h3v3h2v11z" fill="#30383a" />
      <path d="M4 18V9h3V7h10v2h3v9h-3v-6h-2v-2H9v2H7v6z" fill="#77807c" />
      <path d="M7 20v-8h2v-2h6v2h2v8z" fill="#11191b" />
      <path d="M11 13h3v2h-3zM10 15h2v2h-2z" fill="#7fe7d9" />
      <path d="M3 18h4v2H3zM17 18h4v2h-4z" fill="#a5aaa0" />
    </>}
    {name === 'deep-dark' && <>
      <path d="M3 18h18v3H3zM5 14h14v4H5z" fill="#071b20" />
      <path d="M7 10h3v5H7zM14 10h3v5h-3z" fill="#1b6265" />
      <path d="M5 4h2v3h2v3H7V8H5zM17 4h2v4h-2v2h-2V7h2z" fill="#3dbdb6" />
      <path d="M9 12h6v5H9z" fill="#275a5e" /><path d="M10 14h4v2h-4z" fill="#88eee4" />
      <path d="M4 20h2v1H4zM18 19h2v1h-2z" fill="#49a7a3" />
    </>}
    {name === 'nether' && <>
      <path d="M3 14h18v7H3z" fill="#4b2428" /><path d="M4 15h7v2H4zM13 15h7v2h-7zM7 18h8v2H7z" fill="#813630" />
      <path d="M7 13V9h2V6h2V3h2v5h2V5h2v4h2v5h-3v4H8v-5z" fill="#df5e27" />
      <path d="M10 13V9h2V7h1v3h2v3h2v4h-7z" fill="#ffad3f" />
      <path d="M12 13h2v4h-2z" fill="#ffe3a0" />
    </>}
    {name === 'the-end' && <>
      <path d="M3 17h18v3H3zM6 14h12v3H6z" fill="#a6a886" />
      <path d="M8 13h8v2H8zM10 11h4v2h-4z" fill="#d9d9b4" />
      <path d="M10 3h4v2h2v5h-2v2h-4v-2H8V5h2z" fill="#2d1e3b" />
      <path d="M10 5h4v5h-4z" fill="#986bd0" /><path d="M11 6h2v2h-2z" fill="#e2c9ff" />
      <path d="M4 20h3v1H4zM17 20h3v1h-3z" fill="#727659" />
    </>}
    {name === 'credits' && <>
      <path d="M4 3h16v18H4z" fill="#46372a" /><path d="M6 4h12v15H6z" fill="#e7d7ad" />
      <path d="M7 5h2v13H7z" fill="#b69d70" /><path d="M11 8h5v1h-5zM11 11h4v1h-4zM10 15h6v1h-6z" fill="#967a55" />
      <path d="M12 2h2v2h-2zM11 4h4v2h-4zM9 6h8v3H9zM11 9h4v2h-4z" fill="#ebc85e" />
      <path d="M12 5h2v3h-2z" fill="#fff5b6" />
    </>}
  </svg>
}
