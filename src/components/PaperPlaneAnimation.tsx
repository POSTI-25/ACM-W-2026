import { useLayoutEffect, useRef } from 'react';
import gsap from 'gsap';
import { MotionPathPlugin } from 'gsap/MotionPathPlugin';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import planeImg from '../assets/plane.png';
gsap.registerPlugin(MotionPathPlugin,ScrollTrigger);
const path='M 30,120 C 180,180 240,10 420,65 S 740,140 940,35';
export default function PaperPlaneAnimation() {
  const root=useRef<SVGSVGElement>(null);
  useLayoutEffect(()=>{
    if(!root.current)return;
    const media=gsap.matchMedia();
    media.add('(prefers-reduced-motion: no-preference)',()=>{
      gsap.fromTo('.journey-plane',{opacity:0},{opacity:1,duration:.15,scrollTrigger:{trigger:root.current,start:'top 85%',once:true}});
      gsap.fromTo('.journey-plane',{motionPath:{path,start:0,end:0}},{motionPath:{path,autoRotate:true},duration:1.8,ease:'power2.inOut',scrollTrigger:{trigger:root.current,start:'top 85%',once:true}});
    },root);
    return()=>media.revert();
  },[]);
  return <svg ref={root} className="plane-trail" viewBox="0 0 1000 180" aria-hidden="true">
    <path d={path} fill="none" stroke="#580a0a" strokeWidth="1" strokeDasharray="5 8" opacity=".5"/>
    <g className="journey-plane" transform="translate(940 35)"><image href={planeImg} x="-22" y="-18" width="44" height="36"/></g>
  </svg>;
}
