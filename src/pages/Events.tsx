import { useId } from 'react';
import neuralHack from '../assets/NeuralHack.png';
import insipher from '../assets/Inspiher.svg';
import C2C from '../assets/C2C.png';
import { useReveal } from '../lib/useReveal';

const events = [
  {
    title: "C2C",
    logo: C2C,
    rotation: 6.5,
    description:
      "Code2Create is ACM-W’s flagship 48 hour overnight hackathon and one of the largest student run hackathons at VIT Vellore. With 2000+ participants every edition, it brings together developers, designers and problem solvers from across the country to build, innovate and create under one roof.",
  },
  {
    title: "Inspiher",
    logo: insipher,
    rotation: -6.5,
    description:
      "Inspiher is ACM-W’s recurring speaker series dedicated to celebrating women in STEM and the journeys that brought them there. Every edition features an intimate conversation with accomplished women in technology and research.",
  },
  {
    title: "Neural Hack",
    logo: neuralHack,
    rotation: 7,
    description:
      "The Neural Hack is a 36 hour hackathon focused on data-centric machine learning. Participants tackle real-world challenges while learning about responsible AI, data quality and impactful innovation.",
  },
];


function EventArtwork({src}: {src:string}) {
  const id=useId();
  const positions=Array.from({length:18},(_,i)=>i*6);
  return <div className="event-art">
    <svg viewBox="0 0 100 77" preserveAspectRatio="none" aria-hidden="true">
      <defs><mask id={id}><rect width="100" height="77" fill="white" />
        {positions.map(p=><g key={p}><circle cx={p} cy="0" r="1.8" fill="black"/><circle cx={p} cy="77" r="1.8" fill="black"/><circle cx="0" cy={p} r="1.8" fill="black"/><circle cx="100" cy={p} r="1.8" fill="black"/></g>)}
      </mask></defs>
      <rect width="100" height="77" fill="#6b1212" mask={`url(#${id})`}/><rect x="4" y="4" width="92" height="69" fill="#f3e8ce"/>
      <rect x="7" y="7" width="86" height="63" fill="none" stroke="#6b1212" strokeWidth=".2"/>
    </svg>
    <img src={src} alt="" loading="lazy" decoding="async" />
  </div>;
}
export default function EventsPage() {
  const root=useReveal();
  return <div ref={root} className="section-shell events-section">
    <div className="events-heading" data-reveal>
      <div className="section-intro"><p className="eyebrow">02 / THINGS WE MAKE HAPPEN</p><h2>Big ideas.<br/><em>Shared experiences.</em></h2></div>
      <p className="eyebrow">BUILD · LEARN · BELONG</p>
    </div>
    {events.map((event,index)=><article className="event-row" key={event.title}>
      <div data-reveal><EventArtwork src={event.logo}/></div>
      <div className="event-copy" data-reveal><p className="eyebrow">0{index+1} / {['CREATE TOGETHER','VOICES THAT INSPIRE','INNOVATION WITH PURPOSE'][index]}</p><h3>{event.title === 'C2C' ? 'Code2Create' : event.title}</h3><p>{event.description}</p><div className="event-note">{['48 hours. Countless possibilities.','Conversations that open new doors.','36 hours of data-driven discovery.'][index]}</div></div>
    </article>)}
  </div>;
}
