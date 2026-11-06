import { useEffect, useRef, type CSSProperties, type RefObject } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { postcardMotion } from "../lib/postcardFloat";
import { type Globe3DHandle } from "../assets/globe_3d";
import { countryExitY, countrySpin, stemSceneAt, STEM_CHAPTER_SCREENS, STEM_PHASE as P } from "../lib/stemSequence";
import india from "../assets/IN.png";
import poland from "../assets/PL.png";
import uk from "../assets/GB.png";
import austria from "../assets/AT.png";
import us from "../assets/US.png";
import kalpana from "../assets/kaplana.png";
import marie from "../assets/curie.png";
import ada from "../assets/ada.png";
import hedy from "../assets/hedy.png";
import margaret from "../assets/margaret.png";
import "./WomenInStem.css";

gsap.registerPlugin(ScrollTrigger);
const DEG = Math.PI / 180;

type ScientistData = {
  name: string;
  country: string;
  countryId: string;
  photo: string;
  photoSize: [number, number];
  countrySize: [number, number];
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
    countryId: "356",
    photo: kalpana,
    photoSize: [1100, 1517],
    countrySize: [649, 642],
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
    countryId: "616",
    photo: marie,
    photoSize: [1100, 1523],
    countrySize: [566, 470],
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
    countryId: "826",
    photo: ada,
    photoSize: [1100, 1522],
    countrySize: [458, 775],
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
    countryId: "040",
    photo: hedy,
    photoSize: [1100, 1519],
    countrySize: [778, 344],
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
    countryId: "840",
    photo: margaret,
    photoSize: [1100, 1428],
    countrySize: [791, 574],
    focus: { lng: -98, lat: 39 },
    title: "Computer Scientist — United States",
    text: `Margaret Hamilton led the team that developed the on-board flight software for NASA's Apollo missions. Her rigorous approach to software engineering — a term she coined — was critical to the success of the Moon landing and has influenced the discipline ever since.`,
    countryWidth: "min(35rem, 39vw)",
    photoRotation: -4,
    hasFrame: true,
  },
];

export default function WomenInStem({ globeRef, globeMotionRef }: {
  globeRef: RefObject<Globe3DHandle | null>;
  globeMotionRef: RefObject<HTMLDivElement | null>;
}) {
  const rootRef = useRef<HTMLDivElement>(null);
  const viewportRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Decode at page startup, while the visitor is still above this scene.
    rootRef.current?.querySelectorAll<HTMLImageElement>('img').forEach(image => {
      void image.decode().catch(() => undefined);
    });
  }, []);

  useEffect(() => {
    const root = rootRef.current, viewport = viewportRef.current;
    const globeMotion = globeMotionRef.current, globe = globeRef.current;
    if (!root || !viewport || !globeMotion || !globe?.group || !globe.camera) return;
    const group = globe.group, camera = globe.camera;
    const originalOrder = group.rotation.order;
    // Longitude first, latitude second places the selected country at the front.
    group.rotation.order = "XYZ";
    globe.setAutoRotate(false);
    globe.setDragEnabled(false);
    const media = gsap.matchMedia();
    media.add({ mobile: "(max-width: 48rem)", moving: "(prefers-reduced-motion: no-preference)",
      still: "(prefers-reduced-motion: reduce)" }, context => {
      const mobile = Boolean(context.conditions?.mobile), moving = Boolean(context.conditions?.moving);
      const scenes = Array.from(root.querySelectorAll<HTMLElement>(".scientist-section"));
      let timeline: gsap.core.Timeline | undefined;
      const renderState = () => {
        const { index, progress } = stemSceneAt(timeline?.time() ?? 0, scientists.length);
        const highlighted = moving && progress >= P.spinEnd && progress < P.highlightEnd;
        globe.setCountryHighlight(highlighted ? scientists[index].countryId : null);
        root.dataset.country = scientists[index].title.split("—")[1].trim();
        root.dataset.stemPhase = progress < P.enterEnd ? "enter" : progress < P.spinEnd ? "spin"
          : progress < P.highlightEnd ? "highlight" : progress < P.mapEnd ? "map-lift"
          : progress < P.portraitEnd ? "portrait-lift" : progress < P.holdEnd ? "hold" : "exit";
      };
      gsap.set(globeMotion, { y: 0, opacity: 1, scale: 1 });
      gsap.set(group.position, { y: 0 });
      gsap.set(group.rotation, { x: .2, y: -1.85 });
      gsap.set(camera.position, { z: 3 });
      if (moving) timeline = gsap.timeline({
        defaults: { ease: "sine.inOut", immediateRender: false }, onUpdate: renderState,
        scrollTrigger: { trigger: root, start: "top top", end: "bottom bottom",
          scrub: 1, invalidateOnRefresh: true, onRefresh: renderState },
      });
      let previousY = -1.85, previousTilt = .2;
      scenes.forEach((scene, index) => {
        const sci = scientists[index], country = scene.querySelector<HTMLElement>(".country-img")!;
        const photo = scene.querySelector<HTMLElement>(".photo-frame")!;
        const text = scene.querySelector<HTMLElement>(".scientist-text")!;
        const restingPhotoY = () => {
          if (!mobile) return 0;
          const angle = Math.abs(sci.photoRotation) * DEG;
          const half = (photo.offsetHeight * Math.cos(angle) + photo.offsetWidth * Math.sin(angle)) / 2;
          return Math.max(20 + half - innerHeight / 2,
            Math.min(-innerHeight * .04, text.offsetTop - 40 - half - innerHeight / 2));
        };
        const photoX = () => mobile ? 0 : -innerWidth * .18;
        const countryX = () => -innerWidth * (mobile ? .18 : .22);
        const countryY = () => mobile ? restingPhotoY() + innerHeight * .07 : -innerHeight * .035;
        const liftedOrigin = () => {
          const bounds = globe.countryBounds(sci.countryId);
          const canvas = globeMotion.querySelector('canvas');
          const w = canvas?.clientWidth ?? innerWidth, h = canvas?.clientHeight ?? innerHeight;
          if (!bounds) return { x: 0, y: 0, scale: .1 };
          return { x: (bounds.x + bounds.width / 2 - .5) * w,
            y: (bounds.y + bounds.height / 2 - .5) * h,
            scale: gsap.utils.clamp(.025, .8, Math.max(bounds.width * w / country.offsetWidth,
              bounds.height * h / Math.max(1, country.offsetHeight))) };
        };
        gsap.set(country, { xPercent: -50, yPercent: -50, x: countryX, y: countryY,
          scale: mobile ? .75 : 1, rotation: -2, opacity: 1, visibility: moving ? "hidden" : "visible" });
        gsap.set(photo, { xPercent: -50, yPercent: -50, x: photoX,
          y: moving ? innerHeight * 1.5 : restingPhotoY(), rotation: sci.photoRotation + 1.5, opacity: 1 });
        gsap.set(text, { xPercent: mobile ? -50 : 0, yPercent: mobile ? 0 : -50,
          y: moving ? innerHeight * 1.5 : 0, opacity: 1 });
        if (!timeline) return;
        const turn = countrySpin(sci.focus.lng, sci.focus.lat, previousY);
        const at = (phase: number) => index + phase;
        // The globe stays present: bring its ink forward before the next turn.
        timeline.fromTo(globeMotion, { opacity: index ? .18 : 1, scale: index ? .94 : 1 },
          { opacity: 1, scale: 1, duration: P.enterEnd }, at(0));
        timeline.fromTo(camera.position, { z: index ? 2.75 : 3 }, { z: 3, duration: P.enterEnd }, at(0));
        timeline.fromTo(group.rotation, { y: turn.fromY, x: previousTilt },
          { y: turn.toY, x: turn.tilt, duration: P.spinEnd - P.enterEnd }, at(P.enterEnd));
        timeline.fromTo(camera.position, { z: 3 }, { z: 2.75, duration: .12 }, at(P.spinEnd - .12));
        // The patch on the sphere hands over to this cutout at the same point.
        timeline.set(country, { visibility: "visible" }, at(P.highlightEnd));
        timeline.fromTo(country, { x: () => liftedOrigin().x, y: () => liftedOrigin().y,
          scale: () => liftedOrigin().scale, rotation: 0 },
          { x: countryX, y: countryY, scale: mobile ? .75 : 1, rotation: -2,
            duration: P.mapEnd - P.highlightEnd }, at(P.highlightEnd));
        timeline.to(globeMotion, { opacity: .18, scale: .94,
          duration: .16 }, at(P.highlightEnd + .035));
        const foreground = postcardMotion(mobile, true);
        const background = postcardMotion(mobile, false);
        const last = index === scientists.length - 1;
        // About's continuous, linear parallax: no arrival stop or separate exit.
        // Extend the travel to clear this clipped viewport before the next spin.
        const travelStart = Math.max(.9, foreground.fromY);
        const travelEnd = last ? -.2 : foreground.toY - .65;
        const duration = P.exitEnd - P.mapEnd;
        timeline.fromTo(photo, {
          y: () => restingPhotoY() + innerHeight * travelStart,
        }, {
          y: () => restingPhotoY() + innerHeight * travelEnd,
          duration, ease: "none",
        }, at(P.mapEnd));
        const driftingArt = scene.querySelectorAll(".scientist-air");
        timeline.fromTo(driftingArt, { y: 3, rotation: -.25 },
          { y: -4, rotation: .25, duration: duration * .6 }, at(P.mapEnd))
          .to(driftingArt, { y: 3, rotation: -.25, duration: duration * .4 }, at(P.mapEnd + duration * .6));
        // Sweep in from the lower-left while the vertical glide stays continuous.
        timeline.fromTo(photo, {
          x: () => photoX() - innerWidth * (mobile ? .28 : .22),
          rotation: sci.photoRotation - 7,
        }, {
          x: photoX, rotation: sci.photoRotation - 2,
          duration: duration * .55, ease: "sine.out",
        }, at(P.mapEnd));
        timeline.to(photo, {
          x: () => photoX() + innerWidth * foreground.xDrift,
          rotation: sci.photoRotation + foreground.rotationDrift,
          duration: duration * .45, ease: "sine.inOut",
        }, at(P.mapEnd + duration * .55));
        timeline.fromTo(text, { y: () => innerHeight * travelStart }, {
          y: () => innerHeight * travelEnd, duration, ease: "none",
        }, at(P.mapEnd));
        timeline.to(country, {
          y: () => last ? countryY() - innerHeight * .15
            : countryExitY(viewport.clientHeight, country.offsetWidth, country.offsetHeight,
              mobile ? .75 : 1, countryY()),
          x: () => countryX() + innerWidth * background.xDrift,
          rotation: -2 + background.rotationDrift,
          duration, ease: "none",
        }, at(P.mapEnd));
        // This visibility switch happens after the full upward exit, never as a fade.
        if (!last) timeline.set(country, { visibility: "hidden" }, at(P.exitEnd));
        previousY = turn.toY;
        previousTilt = turn.tilt;
      });
      // Reveal the scene containers only after all assets are positioned offscreen.
      gsap.set(scenes, { visibility: "visible" });
      timeline?.set({}, {}, scientists.length);
      renderState();
      return () => {
        globe.setCountryHighlight(null);
      };
    }, root);
    return () => {
      media.revert();
      group.rotation.order = originalOrder;
    };
  }, [globeRef, globeMotionRef]);

  return <div ref={rootRef} className="women-in-stem women-in-stem--sequence"
    style={{ '--scientist-count': scientists.length, '--chapter-screens': STEM_CHAPTER_SCREENS } as CSSProperties}>
    <div ref={viewportRef} className="scientist-viewport">
      {scientists.map(sci => <section key={sci.name} className="scientist-section" aria-label={sci.name}>
        <div className="country-img scientist-country-position" style={{ width: sci.countryWidth }}>
          <div className="scientist-air scientist-air--country">
            <img className="scientist-country-art" src={sci.country} width={sci.countrySize[0]} height={sci.countrySize[1]} alt="" loading="eager" decoding="async" />
          </div>
        </div>
        <div className="photo-frame scientist-portrait-position">
          <div className="scientist-air">
            <img className="scientist-portrait-image" src={sci.photo} width={sci.photoSize[0]} height={sci.photoSize[1]} alt={sci.name} loading="eager" decoding="async" />
          </div>
        </div>
        <div className="scientist-text absolute top-1/2 left-[55%] w-[38%] max-w-[35rem] max-md:left-1/2 max-md:top-auto max-md:bottom-[16vh] max-md:w-[88vw] max-md:max-w-none max-md:-translate-x-1/2 max-md:translate-y-0 max-md:text-center max-md:z-[3] max-md:px-2 max-[30rem]:w-[92vw] max-[30rem]:bottom-[14vh]">
          <h2 className="scientist-name">{sci.name}</h2>
          <p className="scientist-subtitle">{sci.title}</p>
          <p className="scientist-desc">{sci.text}</p>
        </div>
      </section>)}
    </div>
  </div>;
}
