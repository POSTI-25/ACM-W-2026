import { useLayoutEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import PaperPlaneAnimation from "../components/PaperPlaneAnimation";
import "./BestChapter.css";

gsap.registerPlugin(ScrollTrigger);

export default function BestChapter() {
  const root = useRef<HTMLDivElement>(null);

  useLayoutEffect(() => {
    const element = root.current;
    if (!element) return;
    const media = gsap.matchMedia();
    media.add({
      moving: "(prefers-reduced-motion: no-preference)",
      compact: "(max-width: 48rem)",
    }, context => {
      if (!context.conditions?.moving) return;
      const compact = Boolean(context.conditions.compact);
      const card = element.querySelector<HTMLElement>(".award-scene")!;
      // A stable layout wrapper drives the whole composition, keeping the
      // plane, its trail, and the award on the same moving sheet of paper.
      gsap.fromTo(card, {
        y: () => window.innerHeight * (compact ? .18 : .32),
        scale: compact ? .88 : .82,
        rotation: compact ? -1 : -1.8,
      }, {
        y: 0, scale: 1, rotation: 0, ease: "none",
        scrollTrigger: {
          trigger: element,
          start: "top bottom",
          end: compact ? "top 24%" : "top 18%",
          scrub: 1.25,
          invalidateOnRefresh: true,
          onToggle: self => { card.style.willChange = self.isActive ? "transform" : "auto"; },
        },
      });
      return () => { card.style.removeProperty("will-change"); };
    }, element);
    return () => media.revert();
  }, []);

  return (
    <div className="award-reveal" ref={root}>
      <div data-award-card className="award-scene">
        <div data-award-banner className="award-banner">
          <h2>
            Best Emerging
            <br />
            Chapter
          </h2>
          <p>By ACM India</p>
        </div>
        <PaperPlaneAnimation />
      </div>
    </div>
  );
}
