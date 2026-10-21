import { useId } from 'react';
import { INK_FLOW_REST } from './inkFlow';

/** Original bottle silhouette with a live stream and transparent ripple details. */
export default function InkBottleArtwork() {
  const maskId = useId().replace(/:/g, '');
  return <svg className="stationery-ink-svg" width="380" height="240" viewBox="0 0 380 240" fill="none" focusable="false">
    <defs>
      <mask id={maskId} maskUnits="userSpaceOnUse" x="0" y="0" width="380" height="240">
        <rect width="380" height="240" fill="white"/>
        <g stroke="black" strokeWidth="3" strokeLinejoin="round" strokeLinecap="round" fill="none">
          <path d="M222 63 261 30q22-7 40 9l25 59q13 32-8 45l-53 23q-19 7-27-7M263 77l56 20M263 77l-40-14m40 14-6 84M303 40l23 58M206 111l19 43M45 201c42 13 155 13 222 3M80 184c26-11 64-4 88-1m-4 9c32 8 70 6 90-1"/>
          <ellipse cx="178" cy="139" rx="19" ry="28" transform="rotate(-26 178 139)"/>
          <path d="M180 113q17 1 24 23m-15-28q18 1 26 24"/>
        </g>
        <ellipse data-ink-ripple cx="137" cy="188" rx="25" ry="4" fill="none" stroke="black" strokeWidth="1.8" opacity="0"/>
      </mask>
    </defs>
    <path data-ink-stream fill="#201f1d" d={INK_FLOW_REST}/>
    <path data-ink-drop fill="#201f1d" d="M151 161c-2 4-4 6-4 8a3 3 0 0 0 6 0c0-2-1-5-2-8Z" opacity="0"/>
    <g fill="#201f1d" mask={`url(#${maskId})`}>
      <path d="M258 24q27-9 48 9l28 61q16 37-10 55l-57 25q-25 9-39-13l-23-45q-12-24 6-45Z"/>
      <path d="m215 104-30 7q-20 1-28 19-8 20 5 33 10 11 26 2l39-15Z"/>
      <path d="M139 175c-19 8-58-5-66 10-16 5-54 5-57 17-6 17 78 20 115 21 62 3 161-1 181-10 18-9-14-17-44-19-25-15-55-11-75-8-31 3-40-3-54-11Z"/>
      <ellipse cx="291" cy="181" rx="31" ry="3"/>
      <ellipse cx="37" cy="182" rx="7" ry="3"/>
    </g>
  </svg>;
}
