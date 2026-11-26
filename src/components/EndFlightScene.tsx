import { memo } from 'react'
import { FLIGHT_LENGTH, passagesFor, PILLAR_WIDTH, type Flight } from '../lib/endFlight'

const NightSky = memo(function NightSky() {
  return <>
    <defs>
      <linearGradient id="flight-dusk" x2="0" y2="1" gradientUnits="objectBoundingBox">
        <stop stopColor="#17132e" /><stop offset=".55" stopColor="#42305b" /><stop offset="1" stopColor="#a6778e" />
      </linearGradient>
      <pattern id="flight-basalt" width="14" height="18" patternUnits="userSpaceOnUse">
        <rect width="14" height="18" fill="#251a38" />
        <path d="M1 2h6v2H1zm7 9h4v3H8z" fill="#372743" /><path d="M3 14h3v1H3z" fill="#52405d" />
      </pattern>
    </defs>
    <rect width="400" height="200" fill="url(#flight-dusk)" />
    {Array.from({ length: 53 }, (_, i) =>
      <rect key={i} x={(i * 137 + i * i) % 400} y={(i * 53 + 5) % 131} width={i % 7 ? 1 : 2} height="1" fill={i % 3 ? '#b6a3cb' : '#fff1d6'} />
    )}
    <path fill="#d5a9ba" d="M313 28h12v3h4v12h-4v3h-12v-3h-3V31h3z" />
    <path fill="#ba8ea8" d="M313 39h4v3h8v2h-12z" />
  </>
})

function Dragon({ flap }: { flap: boolean }) {
  return <g>
    <path fill="#3e3158" d="m-5 1-15-10-6-10 14 6L2-1z" />
    <path fill="#1b1727" d="M-29-1h8v2h7v2h9v-5H7v-3h6v-4h2v4h3v-3h2v6h6v6H12V3H8v5H4V5H0v5h-4V5h-8V4h-9V2h-8z" />
    <path fill="#73617e" d="M-12 0h6v-3h4v-2h3v3h4v-2h3v4H-6v2h-6zM12-5h2v-4h2v5h-4z" />
    <path fill="#eab1ff" d="M17-2h4v2h-4z" /><path fill="#81718f" d="M23 1h3v1h-3z" />
    <g transform={flap ? 'translate(0 2) scale(1 -.56)' : undefined}>
      <path fill="#23192f" d="M3 1-8-13l-15-8-8-1 7 7 1 9 6-4 4 8 4-4 5 7z" />
      <path fill="#755483" d="m1 0-10-12-17-8 5 5 10 4z" />
      <path fill="#583b68" d="m-18-13 6 4 2 5-5-5z" />
    </g>
  </g>
}

export function EndFlightScene({ flight, crystal = false }: { flight: Flight, crystal?: boolean }) {
  const { x, y, vy } = flight
  const islandOffset = x * .18 % 304
  return <svg className="end-flight__scene" viewBox="0 0 400 200" aria-hidden="true" shapeRendering="crispEdges">
    <NightSky />
    {[0, 1, 2, 3, 4].map(i => <g key={i} transform={`translate(${i * 152 - islandOffset} ${92 + i % 2 * 18})`}>
      <path fill="#66516e" d="M0 15h7v-4h13V9h18V-7h4V9h14V-18h5V8h14v4h14v5H73v5H61v6H48v7H36v-6H23v-6H12v-4H0z" />
      <path fill="#90748c" d="M4 14h16v-3h53v2H39v3H4z" />
    </g>)}
    {(crystal || x < 160) && <g transform={`translate(${130 - x} 99)`}>
      {!crystal && <path fill="#f8d8fd" d="M-2-99h4v87h-4z" opacity=".8" />}
      <path fill="#b993ce" d="M-1 13h2v68h-2z" opacity=".5" />
      <path d="m0-13 10 13L0 13-10 0z" fill="#55335e" stroke="#efbbf6" />
      <path d="m0-8 5 8-5 7-5-7z" fill="#ee9de1" /><path d="m0-8 5 8H0z" fill="#ffe8d7" />
      <path fill="#292037" d="M-12 78h24v23h-24z" />
    </g>}
    {passagesFor(flight).filter(p => p.x > x - 110 && p.x < x + 360).map(p =>
      <g key={p.x} transform={`translate(${68 + p.x - x} 0)`}>
        <rect y={p.floor} width={PILLAR_WIDTH} height={200 - p.floor} fill="url(#flight-basalt)" />
        <path fill="#785986" d={`M0 ${p.floor}h28v3H3v${197-p.floor}H0z`} />
        {p.top > 0 && <><rect width="28" height={p.top} fill="url(#flight-basalt)" /><rect y={p.top-3} width="28" height="3" fill="#91698d" /></>}
        <path d={`M14 ${p.floor - 28}l7 8-7 8-7-8z`} fill="none" stroke="#ffd797" strokeWidth="2" />
      </g>
    )}
    {flight.mode === 'journey' && x > FLIGHT_LENGTH - 340 && <g transform={`translate(${68 + FLIGHT_LENGTH - x} 0)`}>
      <rect width="6" height="200" fill="#f8d9bc" /><rect x="6" width="20" height="200" fill="#deabbb" opacity=".65" />
    </g>}
    <g transform={`translate(68 ${y}) rotate(${vy * .095})`}>
      {flight.boost > 0 && <path fill="#ffe0a0" d="M-58 0h19v1h-19zm13 6h15v1h-15zm2-10h12v1h-12z" />}
      <Dragon flap={Math.floor(x / 20) % 2 === 1} />
    </g>
  </svg>
}

export function DragonFarewell() {
  return <svg className="end-flight__farewell" viewBox="0 0 400 200" aria-hidden="true" shapeRendering="crispEdges">
    <g className="end-flight__departing"><Dragon flap={false} /></g>
  </svg>
}
