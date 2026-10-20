export default function GlobeDrawing() {
  return <svg className="globe-drawing" viewBox="0 0 400 400" fill="none" aria-hidden="true">
    <circle cx="200" cy="200" r="170" stroke="currentColor" strokeWidth=".8"/>
    <ellipse cx="200" cy="200" rx="85" ry="170" stroke="currentColor" strokeWidth=".6"/>
    <ellipse cx="200" cy="200" rx="170" ry="65" stroke="currentColor" strokeWidth=".6"/>
    <path d="M30 200H370M200 30V370" stroke="currentColor" strokeWidth=".6"/>
    <circle cx="200" cy="200" r="190" stroke="currentColor" strokeDasharray="2 9" strokeWidth=".7"/>
  </svg>;
}
