import { useEffect, useRef } from 'react';
import * as THREE from 'three';
import borders from './optimized/world-borders.json';
import GlobeDrawing from '../components/GlobeDrawing';

/** One decorative scene. Its RAF stops offscreen, in background tabs, and for reduced motion. */
export default function Globe3D() {
  const root=useRef<HTMLDivElement>(null);
  const canvas=useRef<HTMLCanvasElement>(null);
  useEffect(()=>{
    const container=root.current, surface=canvas.current;
    if(!container||!surface)return;
    let renderer:THREE.WebGLRenderer;
    try { renderer=new THREE.WebGLRenderer({canvas:surface,antialias:true,alpha:true}); }
    catch { return; } // The inline globe drawing remains visible.
    renderer.setPixelRatio(Math.min(devicePixelRatio||1,1.5));
    const scene=new THREE.Scene();
    const camera=new THREE.PerspectiveCamera(45,1,.1,100);
    camera.position.z=3.05;
    const group=new THREE.Group();
    group.rotation.set(.2,.6,0); scene.add(group);
    const sphereGeometry=new THREE.SphereGeometry(1,48,48);
    const sphereMaterial=new THREE.MeshBasicMaterial({color:0xf3e7d1});
    group.add(new THREE.Mesh(sphereGeometry,sphereMaterial));
    const lineGeometry=new THREE.BufferGeometry();
    lineGeometry.setAttribute('position',new THREE.Float32BufferAttribute(borders,3));
    const lineMaterial=new THREE.LineBasicMaterial({color:0x6b2924,transparent:true,opacity:.8});
    group.add(new THREE.LineSegments(lineGeometry,lineMaterial));
    let frame=0,visible=false,previous=0;
    const media=matchMedia('(prefers-reduced-motion: reduce)');
    const draw=(time:number)=>{
      frame=0;
      if(!visible||document.hidden)return;
      const dt=previous?Math.min((time-previous)/1000,.05):0;
      previous=time;
      if(!media.matches)group.rotation.y+=dt*.09;
      renderer.render(scene,camera);
      container.dataset.globeReady='true';
      if(!media.matches)frame=requestAnimationFrame(draw);
    };
    const sync=()=>{
      cancelAnimationFrame(frame); frame=0; previous=0;
      if(visible&&!document.hidden)frame=requestAnimationFrame(draw);
    };
    const resize=()=>{
      const {width,height}=container.getBoundingClientRect();
      renderer.setSize(Math.max(width,1),Math.max(height,1),false);
      camera.aspect=width/Math.max(height,1); camera.updateProjectionMatrix(); sync();
    };
    const observer=new IntersectionObserver(entries=>{
      visible=entries[0].isIntersecting; sync();
    });
    const sizing=new ResizeObserver(resize);
    observer.observe(container); sizing.observe(container); resize();
    document.addEventListener('visibilitychange',sync);
    media.addEventListener('change',sync);
    return()=>{
      cancelAnimationFrame(frame); observer.disconnect(); sizing.disconnect();
      document.removeEventListener('visibilitychange',sync); media.removeEventListener('change',sync);
      renderer.dispose(); sphereGeometry.dispose(); sphereMaterial.dispose(); lineGeometry.dispose(); lineMaterial.dispose();
      delete container.dataset.globeReady;
    };
  },[]);
  return <div ref={root} className="globe-view"><GlobeDrawing/><canvas ref={canvas} aria-hidden="true"/></div>;
}
