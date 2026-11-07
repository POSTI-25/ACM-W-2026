import { useId } from 'react';

/** Pressed brass flanges, recessed openings and engraved stock markings. */
export default function VintageFilmReel() {
  const id = useId().replace(/:/g, '');
  return <svg viewBox="0 0 320 320" width="320" height="320" aria-hidden="true">
    <defs>
      <radialGradient id={`${id}-brass`} cx="34%" cy="23%" r="85%">
        <stop stopColor="#d8bd88"/><stop offset=".32" stopColor="#a58a60"/>
        <stop offset=".65" stopColor="#766247"/><stop offset=".86" stopColor="#b1976c"/>
        <stop offset="1" stopColor="#514535"/>
      </radialGradient>
      <linearGradient id={`${id}-rim`} x2=".85" y2="1">
        <stop stopColor="#ebd6a4"/><stop offset=".3" stopColor="#79603d"/>
        <stop offset=".7" stopColor="#392e24"/><stop offset="1" stopColor="#baa078"/>
      </linearGradient>
      <pattern id={`${id}-brush`} width="5" height="5" patternUnits="userSpaceOnUse" patternTransform="rotate(-28)">
        <path d="M0 1H5" stroke="#fff0cd" strokeOpacity=".09" strokeWidth=".5"/>
        <path d="M0 4H5" stroke="#342619" strokeOpacity=".1" strokeWidth=".4"/>
      </pattern>
      <path id={`${id}-legend`} d="M39 160a121 121 0 1 1 242 0a121 121 0 1 1-242 0"/>
    </defs>
    <circle cx="160" cy="160" r="156" fill="#302820" stroke="#b99b6c" strokeWidth="3"/>
    <circle cx="160" cy="160" r="151" fill={`url(#${id}-rim)`}/>
    <circle cx="160" cy="160" r="143" fill={`url(#${id}-brass)`} stroke="#493c2e" strokeWidth="2"/>
    <circle cx="160" cy="160" r="140" fill={`url(#${id}-brush)`}/>
    <circle cx="160" cy="160" r="136" fill="none" stroke="#ebd7ae" strokeOpacity=".4"/>
    <circle cx="160" cy="160" r="148" fill="none" stroke="#f9e1b1" strokeOpacity=".27" strokeDasharray="2 31 18 75 4 42"/>
    {[0, 72, 144, 216, 288].map(angle => <g key={angle} transform={`rotate(${angle} 160 160)`}>
      <path d="M142 65Q160 53 178 65L188 104Q190 119 176 125Q160 132 144 125Q130 119 132 104Z"
        fill="#312925" stroke="#d2b580" strokeWidth="2"/>
      <path d="M144 68Q160 59 176 68L185 105" fill="none" stroke="#100e0d" strokeOpacity=".7" strokeWidth="3"/>
      <circle cx="160" cy="34" r="3" fill="#53412b" stroke="#ccb080" strokeWidth="1"/>
      <path d="M158 34h4" stroke="#251e19" strokeWidth="1"/>
      <path d="M119 46l-4 3m8 3-7 2m-4 98 4-1" stroke="#e4c89c" strokeOpacity=".35" strokeWidth=".8"/>
    </g>)}
    <text fill="#3d3023" fontFamily="Georgia, serif" fontSize="8" letterSpacing="3">
      <textPath href={`#${id}-legend`} startOffset="5%">ACM-W · MOTION PICTURE · 35 MM · ARCHIVE No. 2026</textPath>
    </text>
    <circle cx="160" cy="160" r="34" fill={`url(#${id}-rim)`} stroke="#4b3a28" strokeWidth="3"/>
    <circle cx="160" cy="160" r="26" fill="#8e7350" stroke="#c9aa76"/>
    <circle cx="160" cy="160" r="16" fill="#332921" stroke="#e0bf86" strokeWidth="2"/>
    <rect x="156" y="151" width="8" height="18" rx="2" fill="#191817"/>
    <path d="M89 224q21 19 47 20m58-206 21 9m20 191-12 8" fill="none" stroke="#2c2119" strokeOpacity=".25" strokeWidth="1"/>
  </svg>;
}
