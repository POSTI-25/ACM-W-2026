import { useId } from 'react';
import InkBottleArtwork from './InkBottleArtwork';
import feather from '../assets/decor/black-feather.svg';
import quill from '../assets/editorial/quill-inkwell.png';
import flowers from '../assets/footer/dried-wildflower-sprig.webp';
import './CircularTransitionArt.css';

type Motif = 'ink' | 'feather' | 'quill' | 'flowers' | 'book' | 'letter' | 'camera' | 'frames' | 'seal' | 'plane';
const scenes: Record<string, readonly [Motif, Motif, Motif]> = {
  events: ['ink', 'feather', 'seal'],
  blogs: ['book', 'quill', 'plane'],
  team: ['letter', 'flowers', 'seal'],
  contributors: ['flowers', 'letter', 'plane'],
  gallery: ['camera', 'frames', 'seal'],
  contact: ['letter', 'quill', 'seal'],
};

function Illustration({ motif }: { motif: Motif }) {
  if (motif === 'ink') return <InkBottleArtwork />;
  const image = motif === 'feather' ? feather : motif === 'quill' ? quill : motif === 'flowers' ? flowers : null;
  if (image) return <img className={`transition-art-image transition-art-image--${motif}`} src={image} alt="" draggable={false} decoding="async" />;

  return <svg viewBox="0 0 400 300" fill="none" focusable="false" className="transition-art-engraving">
    {motif === 'book' && <>
      <path className="transition-art-paper" d="M200 86C152 57 92 59 25 75L18 243C85 226 149 230 200 259C251 230 315 226 382 243L375 75C308 59 248 57 200 86Z" />
      <path d="M200 86v173M25 75l13-16c64-11 118-7 162 22 44-29 98-33 162-22l13 16M18 243l-4 11c71-14 132-10 186 17 54-27 115-31 186-17l-4-11M38 59l-8 168c59-10 113-4 170 32M362 59l8 168c-59-10-113-4-170 32" />
      {[0, 1, 2, 3, 4, 5, 6].map(i => <g key={i} opacity={i % 3 === 0 ? '.8' : '.5'}>
        <path d={`M56 ${91+i*18}q60-7 119 16M225 ${107+i*18}q59-23 119-16`} />
      </g>)}
      <path d="m242 62-5-32 29-9 10 33-18 17-7-21-9 12Z" fill="currentColor" fillOpacity=".22" />
      <path d="M207 267v7m-12-6v7M45 237l-14 14m27-12-14 14m28-11-13 13m276-18 14 14m-27-12 14 14m-28-11 13 13" opacity=".45" />
    </>}
    {motif === 'letter' && <>
      <path className="transition-art-paper" d="m29 69 324-15 16 203-324 15Z" />
      <path d="m29 69 165 124L353 54M45 272l114-105m210 90L246 163M43 80l150 113L340 69M58 257l89-82m206 65-96-72" />
      <path d="m52 42 287-12 2 24M64 39l3-17 244 2 8 9" opacity=".65" />
      <path d="M232 178c3 8-3 12-3 20 0 8-9 9-15 13-6 5-13-1-21-1s-15 5-21-1-14-7-14-15-5-14 1-20 7-14 15-14 14-5 21 0 16 1 20 8 14 2 17 10Z" fill="currentColor" fillOpacity=".22" />
      <circle cx="195" cy="186" r="20" /><circle cx="195" cy="186" r="15" />
      <path d="m195 175 3 8 8 3-8 3-3 8-3-8-8-3 8-3Z" fill="currentColor" fillOpacity=".65" />
      {[0,1,2,3].map(i => <path key={i} d={`m${63+i*10} 96 17 13m${259+i*7} 112 7 8`} opacity=".4" />)}
    </>}
    {motif === 'camera' && <>
      <path className="transition-art-paper" d="M47 99h106l23-30h110l18 30h49v153H47Z" />
      <path d="M47 112h306M47 234h306M61 112v122m277-122v122M67 99V84h56v15m63-30V56h71v13M176 99l11-19h88l12 19" />
      <circle cx="221" cy="174" r="68" /><circle cx="221" cy="174" r="58" /><circle cx="221" cy="174" r="47" /><circle cx="221" cy="174" r="35" />
      <path d="m205 143 35 2 15 31-19 28-33-1-17-29Z" /><path d="m205 143 5 27 30-25m15 31-27-8 8 36m-33-1 23-21-40-8" opacity=".7" />
      <rect x="78" y="136" width="48" height="31" rx="3" /><path d="M84 142h36v19H84Z" />
      <circle cx="314" cy="132" r="6" /><path d="M88 252v12h34v-12m159 0v12h34v-12M54 97C11 68 13 215 46 218M354 101c34-23 34 123 0 118" />
      {[0,1,2,3,4,5,6].map(i => <path key={i} d={`m${73+i*8} 184-6 34m${294+i*5} 0-4 34`} opacity=".28" />)}
    </>}
    {motif === 'frames' && <>
      <path className="transition-art-paper" d="m96 21 273 35-29 225-273-35Z" />
      <path d="m113 40 236 30-20 156-236-30Z" /><path d="m105 170 64-48 38 42 53-57 76 89" opacity=".55" /><circle cx="166" cy="84" r="15" />
      <path className="transition-art-paper" d="m27 76 272-20 16 225-272 20Z" />
      <path d="m46 92 235-18 12 158-235 17Z" /><path d="m58 213 66-76 38 43 56-70 72 91" opacity=".55" /><circle cx="106" cy="122" r="17" />
      <path d="m73 270 66-5m13-1 72-5" opacity=".4" />
    </>}
    {motif === 'seal' && <g transform="translate(50 0)">
      <circle cx="150" cy="150" r="112" /><circle cx="150" cy="150" r="99" strokeDasharray="2 6" /><circle cx="150" cy="150" r="76" />
      <path d="m150 112 9 29 29 9-29 9-9 29-9-29-29-9 29-9Z" fill="currentColor" fillOpacity=".15" />
      <path d="M54 67 39 45m27 8-7-25m177 39 15-22m-27 8 7-25M43 237l-18 7m32 8-15 15m215-30 18 7m-32 8 15 15" />
      <text x="150" y="96" textAnchor="middle">ACM-W · VIT</text><text x="150" y="217" textAnchor="middle">VELLORE · INDIA</text>
    </g>}
    {motif === 'plane' && <>
      <path className="transition-art-paper" d="m39 121 315-83-99 228-70-94Z" />
      <path d="m185 172 169-134-137 165-32-31Zm32 31 38 63M39 121l151 31L354 38" />
      <path d="M70 198c-67 14-25 90 33 67 48-19-2-66-32-35" strokeDasharray="4 9" />
    </>}
  </svg>;
}

const route = 'M-60 158C120 280 230 12 450 126S780 266 980 112 1270 40 1495 154';

/** Clipped to measured areas above/below the heading, including during drift. */
export default function CircularTransitionArt({ section, trailsOnly = false }: { section: string; trailsOnly?: boolean }) {
  const id = useId().replace(/:/g, '');
  const [primary, secondary, accent] = scenes[section] ?? scenes.events;
  const trail = (suffix: string) => <svg className="transition-art-route" viewBox="0 0 1440 280" preserveAspectRatio="none" fill="none" focusable="false">
    <defs><mask id={`${id}-${suffix}`}><path data-transition-trail d={route} pathLength="1" stroke="white" strokeWidth="12" strokeDasharray="1" /></mask></defs>
    <path d={route} className="transition-art-route-ghost" />
    <path d={route} className="transition-art-route-ink" mask={`url(#${id}-${suffix})`} />
  </svg>;
  return <div className={`circular-transition-art circular-transition-art--${section}`} aria-hidden="true">
    <div className="transition-art-zone transition-art-zone--upper">
      {trail('upper')}
      {!trailsOnly && <>
        <div className="transition-art-piece transition-art-piece--secondary" data-transition-art data-depth=".7" data-tilt="8">
          <div className="transition-art-ink"><Illustration motif={secondary} /></div>
        </div>
        <div className="transition-art-piece transition-art-piece--accent" data-transition-art data-depth=".35" data-tilt="-12">
          <div className="transition-art-ink"><Illustration motif={accent} /></div>
        </div>
      </>}
    </div>
    <div className="transition-art-zone transition-art-zone--lower">
      {trail('lower')}
      {!trailsOnly && <div className="transition-art-piece transition-art-piece--primary" data-transition-art data-depth="1" data-tilt="-7">
        <div className="transition-art-ink"><Illustration motif={primary} /></div>
      </div>}
    </div>
  </div>;
}
