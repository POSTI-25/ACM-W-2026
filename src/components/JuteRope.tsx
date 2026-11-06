import { ropeDetails, type Point } from './juteRopeGeometry';

export function JuteRope({ d, points }: { d: string; points: readonly Point[] }) {
  const { plies, hairs } = ropeDetails(points);
  return <g>
    <path data-rope-base d={d} stroke="#3d2917" strokeWidth="7.4" opacity=".45" transform="translate(.5 1.1)"/>
    <path data-rope-base data-rope-spine d={d} stroke="#927044" strokeWidth="5.8"/>
    {plies.map((path, index) => <g key={index}>
      <path data-rope-ply={index} d={path} stroke={['#bfa06b', '#d9bd88', '#a88752'][index]} strokeWidth="1.85"/>
      <path data-rope-ply={index} d={path} stroke="#f0d9a5" strokeWidth=".38" transform="translate(-.35 -.35)" opacity=".8"/>
    </g>)}
    <path data-rope-hairs d={hairs} stroke="#dbc18c" strokeWidth=".32" opacity=".7"/>
  </g>;
}
