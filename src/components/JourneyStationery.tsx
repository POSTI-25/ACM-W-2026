import featherSilhouette from '../assets/decor/black-feather.svg';
import spilledInk from '../assets/decor/spilled-ink.svg';

type StationeryKind = 'quill' | 'ink';

/** Independent transform layers keep scroll motion separate from ambient motion. */
export default function JourneyStationery({ kind }: { kind: StationeryKind }) {
  const feather = kind === 'quill';
  return <div className={`journey-asset journey-asset--${kind}`} data-stationery={kind}>
    <div className="stationery-scroll" data-stationery-scroll>
      <div className="stationery-float" data-stationery-float>
        <div className="stationery-artwork">
          <img src={feather ? featherSilhouette : spilledInk} alt=""
            width={feather ? 320 : 380} height={feather ? 560 : 240}
            decoding="async" draggable={false}/>
        </div>
      </div>
    </div>
  </div>;
}
