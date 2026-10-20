import { lazy, Suspense, useEffect, useRef, useState } from 'react';
import GlobeDrawing from './GlobeDrawing';
import { useReveal } from '../lib/useReveal';
const Globe=lazy(()=>import('../assets/globe_3d'));

export default function TitleCard() {
  const root=useReveal();
  const orb=useRef<HTMLDivElement>(null);
  const [enhance,setEnhance]=useState(false);
  useEffect(()=>{
    const element=orb.current;
    if(!element)return;
    const media=matchMedia('(prefers-reduced-motion: reduce)');
    const observer=new IntersectionObserver(entries=>{
      if(entries[0].isIntersecting&&!media.matches){setEnhance(true);observer.disconnect();}
    },{rootMargin:'250px'});
    if(!media.matches)observer.observe(element);
    const update=()=>{if(media.matches){setEnhance(false);observer.disconnect();}else observer.observe(element);};
    media.addEventListener('change',update);
    return()=>{observer.disconnect();media.removeEventListener('change',update);};
  },[]);
  return <div className="stem-title" ref={root}>
    <div className="section-shell stem-title__layout">
      <div className="stem-title__copy" data-reveal>
        <p className="eyebrow">05 / NO BORDERS TO BRILLIANCE</p>
        <h2>Women<br/>in <em>STEM.</em></h2>
        <p>Different places. Extraordinary minds.<br/>A world of possibility.</p>
        <a href="#women-in-stem" className="text-link">Meet the women who moved the world <span aria-hidden="true">↓</span></a>
      </div>
      <div className="stem-orb" ref={orb} aria-hidden="true">
        <span className="orb-label">CURIOSITY KNOWS NO BORDERS</span>
        <Suspense fallback={<GlobeDrawing/>}>{enhance?<Globe/>:<GlobeDrawing/>}</Suspense>
        <span className="orb-footnote">LET HER STORY INSPIRE YOURS</span>
      </div>
    </div>
  </div>;
}
