import { useId } from 'react';
import quill from '../assets/decor/black-feather.svg';
import artwork from '../assets/award/award-engraving.json';

// A broad, rounded loop with matching tangents through its entry and exit.
const gesture = 'M32 235C32 178 64 184 100 202C140 222 153 227 180 198C207 169 266 92 248 51C230 10 188 45 194 91C200 137 232 225 263 188C294 151 308 113 345 118C382 123 414 129 439 101C452 86 446 58 465 53L488 48';

const lines = [0, 1].map(line => {
  const boxes = artwork.glyphs.filter(glyph => glyph.line === line).map(glyph => glyph.bounds);
  const top = Math.min(...boxes.map(box => box[1]));
  const bottom = Math.max(...boxes.map(box => box[1]+box[3]));
  const y = (top+bottom)/2-85;
  let coordinate = 0;
  // Bake the horizontal scaling into the path so distance measures match the visible motion.
  return gesture.replace(/-?\d+(?:\.\d+)?/g, value => String(
    coordinate++ % 2 === 0 ? Number(value)*artwork.width/500 : y+Number(value)*170/320,
  ));
});

export default function AwardEngraving() {
  const id = useId().replace(/:/g, '');
  return <h2 className="award-title">
    <span className="award-title__accessible">{artwork.text}</span>
    <svg className="award-engraving" viewBox={`0 0 ${artwork.width} ${artwork.height}`}
      aria-hidden="true" focusable="false">
      <defs>
        <filter id={`${id}-edge`} x="-30%" y="-30%" width="160%" height="160%">
          <feTurbulence type="fractalNoise" baseFrequency=".055 .085" numOctaves="2" seed="4" result="grain" />
          <feDisplacementMap in="SourceGraphic" in2="grain" scale="4" />
          <feGaussianBlur stdDeviation=".65" />
        </filter>
        <filter id={`${id}-impression`} x="-10%" y="-10%" width="120%" height="120%">
          <feDropShadow dx=".5" dy="1" stdDeviation=".2" floodColor="#fff0c6" floodOpacity=".6" />
        </filter>
        {artwork.glyphs.map(({ bounds: [x, y, width, height] }, index) =>
          <mask key={index} id={`${id}-${index}`} maskUnits="userSpaceOnUse"
            x={x-5} y={y-5} width={width+10} height={height+10}>
            <g data-award-glyph-reveal filter={`url(#${id}-edge)`} fill="white">
              <circle cx={x+width*.12} cy={y+height*.7} r={Math.hypot(width,height)*1.4} />
              <circle cx={x+width*.5} cy={y+height*.3} r={Math.hypot(width,height)*1.4} />
              <circle cx={x+width*.8} cy={y+height*.65} r={Math.hypot(width,height)*1.4} />
            </g>
          </mask>)}
      </defs>
      {lines.map((d, line) => <path key={line} data-award-gesture data-award-line={line} d={d}
        pathLength="1" className="award-engraving__gesture" />)}
      <g filter={`url(#${id}-impression)`}>
        {artwork.glyphs.map(({ d }, index) => <path key={index} data-award-glyph
          d={d} mask={`url(#${id}-${index})`} className="award-engraving__ink" />)}
      </g>
      <g data-award-quill className="award-engraving__quill">
        <image href={quill} x="-12.4" y="-372" width="220" height="385" />
      </g>
    </svg>
  </h2>;
}
