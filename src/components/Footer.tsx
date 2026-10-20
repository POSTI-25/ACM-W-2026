import { useEffect, useRef, useState } from 'react';
import framePink from '../assets/footer/Group 1000007240.png';
import frameNavy from '../assets/footer/Group 1000007241.png';
import doodleBalloon from '../assets/footer/doodle-balloon.png';
import doodleLighthouse from '../assets/footer/doodle-lighthouse.png';
import { useReveal } from '../lib/useReveal';
const modules=import.meta.glob<{default:string}>('../assets/optimized/gallery-*.webp',{eager:true});
const photos=Object.entries(modules).sort(([a],[b])=>a.localeCompare(b,undefined,{numeric:true})).map(([,module])=>module.default);
export default function Footer() {
  const root=useReveal();
  const strip=useRef<HTMLDivElement>(null);
  const [current,setCurrent]=useState(0);
  useEffect(()=>{
    const element=strip.current;
    if(!element)return;
    let frame=0;
    const update=()=>{
      frame=0;
      const items=Array.from(element.querySelectorAll<HTMLElement>('[data-gallery-item]'));
      const center=element.scrollLeft+element.clientWidth/2;
      let nearest=0,distance=Infinity;
      items.forEach((item,index)=>{const next=Math.abs(item.offsetLeft+item.offsetWidth/2-center);if(next<distance){nearest=index;distance=next;}});
      setCurrent(nearest);
    };
    const schedule=()=>{if(!frame)frame=requestAnimationFrame(update);};
    const observer=new ResizeObserver(schedule);
    observer.observe(element); element.addEventListener('scroll',schedule,{passive:true}); schedule();
    return()=>{observer.disconnect();element.removeEventListener('scroll',schedule);cancelAnimationFrame(frame);};
  },[]);
  const move=(direction:number)=>{
    const element=strip.current;
    const item=element?.querySelectorAll<HTMLElement>('[data-gallery-item]')[Math.max(0,Math.min(photos.length-1,current+direction))];
    if(element&&item)element.scrollTo({left:item.offsetLeft-(element.clientWidth-item.offsetWidth)/2,behavior:matchMedia('(prefers-reduced-motion: reduce)').matches?'instant':'smooth'});
  };
  return <div className="memories-section" ref={root}>
    <div className="section-shell memories-heading" data-reveal><div className="section-intro"><p className="eyebrow">FROM THE CHAPTER ARCHIVE</p><h2>A few moments.<br/><em>A lot of memories.</em></h2></div><p className="section-deck">The people, the places, the in-between.<br/>This is what community looks like.</p></div>
    <div ref={strip} className="memory-strip" role="region" aria-label="Chapter photo gallery" tabIndex={0}>
      <div className="memory-track">
        {photos.map((photo,index)=><figure key={photo} data-gallery-item className={`memory-card ${current===index?'memory-card--active':''}`}>
          <div className="memory-frame"><img className="memory-frame__border" src={index%2?frameNavy:framePink} alt="" loading="lazy"/><img className="memory-photo" src={photo} alt={`A moment from the ACM-W chapter archive, photograph ${index+1}`} width={1100} height={825} loading="lazy" decoding="async"/><img className="memory-doodle" src={index%2?doodleLighthouse:doodleBalloon} alt="" loading="lazy"/></div>
          <figcaption>FROM OUR ALBUM <span>NO. {String(index+1).padStart(2,'0')}</span></figcaption>
        </figure>)}
      </div>
    </div>
    <div className="editorial-controls"><button type="button" className="round-arrow" aria-label="Previous photo" disabled={current===0} onClick={()=>move(-1)}>←</button><p role="status">{String(current+1).padStart(2,'0')} <span>/ {String(photos.length).padStart(2,'0')}</span></p><button type="button" className="round-arrow" aria-label="Next photo" disabled={current===photos.length-1} onClick={()=>move(1)}>→</button></div>
  </div>;
}
