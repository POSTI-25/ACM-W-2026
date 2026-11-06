import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import Globe3D, { type Globe3DHandle } from "../assets/globe_3d";
import TitleCard from "./TitleCard";
import WomenInStem from "../pages/WomenInStem";
import "./WomenJourney.css";

gsap.registerPlugin(ScrollTrigger);

/** One persistent globe; the existing title and postcard sections keep their layout. */
export default function WomenJourney() {
  const titleRef = useRef<HTMLElement>(null);
  const introRef = useRef<HTMLDivElement>(null);
  const globeMotionRef = useRef<HTMLDivElement>(null);
  const globeRef = useRef<Globe3DHandle>(null);

  useEffect(() => {
    const title = titleRef.current, intro = introRef.current, globe = globeRef.current;
    if (!title || !intro || !globe?.group) return;
    const media = gsap.matchMedia();
    media.add("(prefers-reduced-motion: no-preference)", () => {
      const titleScale = () => Math.min(innerWidth * .84, innerHeight * .84, 736)
        / Math.min(innerWidth, innerHeight, 928);
      const introPose = { y: -1.6 };
      const timeline = gsap.timeline({ scrollTrigger: {
        trigger: title, start: "top bottom", end: "bottom top", scrub: .6,
        invalidateOnRefresh: true,
      } });
      timeline.fromTo(intro, { opacity: 0, scale: () => titleScale() * .8 },
        { opacity: 1, scale: titleScale, duration: .26, ease: "power2.out" }, .16)
        .to(intro, { scale: 1, duration: .5, ease: "none" }, .5)
        .fromTo(introPose, { y: -1.6 }, {
          y: -1.85, duration: 1, ease: "none",
          onUpdate: () => {
            // Release rotation completely to the existing country timeline.
            if (title.getBoundingClientRect().bottom > 0) {
              globe.group!.rotation.y = introPose.y;
              globe.group!.rotation.x = .2;
            }
          },
        }, 0);
    });
    return () => media.revert();
  }, []);

  return <div className="stem-globe-journey">
    <div className="globe-sticky-container stem-shared-globe" aria-hidden="true">
      <div ref={introRef} className="stem-globe-intro">
        <div ref={globeMotionRef} className="globe-stage">
          <Globe3D ref={globeRef} className="globe-soft-edge" size="min(100vw, 100svh, 58rem)"
            lineColor="#5d0f14" sphereColor="#fff9e9" initialRotX={.2} initialRotY={-1.6}
            rotationSpeed={0} enableDrag={false} />
        </div>
      </div>
    </div>
    <section ref={titleRef} id="title-card-section"><TitleCard /></section>
    <section id="women-in-stem">
      <WomenInStem globeRef={globeRef} globeMotionRef={globeMotionRef} />
    </section>
  </div>;
}
