import type { CSSProperties } from 'react';
import { useReveal } from '../lib/useReveal';
import india from '../assets/IN.png';
import poland from '../assets/PL.png';
import uk from '../assets/GB.png';
import austria from '../assets/AT.png';
import us from '../assets/US.png';
import kalpana from '../assets/optimized/kaplana.webp';
import marie from '../assets/optimized/curie.webp';
import ada from '../assets/optimized/ada.webp';
import hedy from '../assets/optimized/hedy.webp';
import margaret from '../assets/optimized/margaret.webp';

type ScientistData = {
  name: string;
  country: string;
  photo: string;
  /** Geographic centre of the country on the real globe */
  focus: { lng: number; lat: number };
  title: string;
  text: string;
  countryWidth: string;
  photoRotation: number;
  /** true when the photo PNG already includes a vintage paper frame */
  hasFrame: boolean;
};

const scientists: ScientistData[] = [
  {
    name: "Kalpana Chawla",
    country: india,
    photo: kalpana,
    focus: { lng: 79, lat: 22 },
    title: "Astronaut — India",
    text: `Kalpana Chawla was the first woman of Indian origin in space. She served as a mission specialist and primary robotic arm operator on Space Shuttle Columbia. Her journey inspired millions of women to pursue science, aerospace and engineering.`,
    countryWidth: "min(32.5rem, 36vw)",
    photoRotation: -5,
    hasFrame: false,
  },
  {
    name: "Marie Curie",
    country: poland,
    photo: marie,
    focus: { lng: 20, lat: 52 },
    title: "Physicist — Poland",
    text: `Marie Curie pioneered research on radioactivity and became the first woman to win a Nobel Prize. She remains the only person to win Nobel Prizes in two scientific fields — Physics and Chemistry.`,
    countryWidth: "min(28.75rem, 32vw)",
    photoRotation: -3,
    hasFrame: false,
  },
  {
    name: "Ada Lovelace",
    country: uk,
    photo: ada,
    focus: { lng: -2, lat: 54 },
    title: "Mathematician — United Kingdom",
    text: `Ada Lovelace is widely regarded as the world's first computer programmer. Her notes on Charles Babbage's Analytical Engine introduced the idea that machines could go beyond calculations and manipulate symbols.`,
    countryWidth: "min(25rem, 28vw)",
    photoRotation: -6,
    hasFrame: false,
  },
  {
    name: "Hedy Lamarr",
    country: austria,
    photo: hedy,
    focus: { lng: 14, lat: 47.5 },
    title: "Inventor — Austria",
    text: `Hedy Lamarr co-invented a frequency-hopping spread spectrum communication system during World War II that laid the groundwork for modern Wi-Fi, Bluetooth, and GPS technologies. Her dual legacy as a Hollywood icon and brilliant inventor defied every expectation placed upon her.`,
    countryWidth: "min(30rem, 33.5vw)",
    photoRotation: -4,
    hasFrame: true,
  },
  {
    name: "Margaret Hamilton",
    country: us,
    photo: margaret,
    focus: { lng: -98, lat: 39 },
    title: "Computer Scientist — United States",
    text: `Margaret Hamilton led the team that developed the on-board flight software for NASA's Apollo missions. Her rigorous approach to software engineering — a term she coined — was critical to the success of the Moon landing and has influenced the discipline ever since.`,
    countryWidth: "min(35rem, 39vw)",
    photoRotation: -4,
    hasFrame: true,
  },
];


export default function WomenInStem() {
  const root=useReveal();
  return <div className="scientist-stories section-shell" ref={root}>
    {scientists.map((scientist,index)=><article className={`scientist-row ${index%2?'scientist-row--reverse':''}`} key={scientist.name}>
      <div className="scientist-visual" data-reveal>
        <img src={scientist.country} className="country-art" alt="" loading="lazy" decoding="async"/>
        <figure className="scientist-portrait" style={{'--portrait-rotation':`${scientist.photoRotation/2}deg`} as CSSProperties}>
          <img src={scientist.photo} alt={scientist.name} width={800} height={1000} loading="lazy" decoding="async"/>
          <figcaption>A LETTER OF POSSIBILITY · 0{index+1}</figcaption>
        </figure>
      </div>
      <div className="scientist-info" data-reveal>
        <p className="eyebrow">0{index+1} / 05 · WOMEN WHO CHANGED THE WORLD</p>
        <h3>{scientist.name}</h3>
        <p className="scientist-location">{scientist.title}</p>
        <p className="scientist-biography">{scientist.text}</p>
        <span className="story-flourish" aria-hidden="true">✳</span>
      </div>
    </article>)}
    <div className="chapter-divider"><span aria-hidden="true">✳</span><span>THE NEXT STORY COULD BE YOURS</span><span aria-hidden="true">✳</span></div>
  </div>;
}
