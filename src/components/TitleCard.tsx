import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

const FONT = "'Playfair Display', Georgia, serif";
const COLOR = "#5a0a10";

function TextBlock({ flip = false }: { flip?: boolean }) {
  const smallSz = "var(--stem-small, clamp(5.5rem, 9vw, 7.6rem))";
  const largeSz = "var(--stem-large, clamp(13rem, 21vw, 18.4rem))";

  const smallStyle: React.CSSProperties = {
    fontFamily: FONT,
    fontWeight: 900,
    fontSize: smallSz,
    letterSpacing: "-0.03em",
    color: COLOR,
    lineHeight: 0.95,
    whiteSpace: "nowrap",
    display: "block",
  };

  const largeStyle: React.CSSProperties = {
    fontFamily: FONT,
    fontWeight: 900,
    fontSize: largeSz,
    letterSpacing: "-0.04em",
    color: COLOR,
    lineHeight: 0.88,
    whiteSpace: "nowrap",
    display: "flex",
    alignItems: "center",
  };

  return (
    <div
      style={{
        display: "flex",
        flexDirection: flip ? "row-reverse" : "row",
        alignItems: "center",
        gap: "clamp(0.375rem, 1.2vw, 1.125rem)",
      }}
    >
      <div style={{ display: "flex", flexDirection: "column" }}>
        <span style={smallStyle}>WOMEN</span>
        <span style={smallStyle}>STEM</span>
      </div>

      <span style={largeStyle}>IN</span>
    </div>
  );
}

/** Full-screen title between Blogs and WomenInStem. */
export default function TitleCard() {
  const sectionRef = useRef<HTMLDivElement>(null);
  const topBlockRef = useRef<HTMLDivElement>(null);
  const botBlockRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const section = sectionRef.current;
    const topBlock = topBlockRef.current;
    const botBlock = botBlockRef.current;
    if (!section || !topBlock || !botBlock) return;
    const media = gsap.matchMedia();
    media.add({ moving: '(prefers-reduced-motion: no-preference)', still: '(prefers-reduced-motion: reduce)' }, context => {
      if (!context.conditions?.moving) {
        gsap.set([topBlock, botBlock], { opacity: 1, x: 0 });
        return;
      }
      const tl = gsap.timeline({
        defaults: { ease: "none" },
        scrollTrigger: { trigger: section, start: "top bottom", end: "bottom top", scrub: 0.6 },
      });
      tl.fromTo(topBlock, { opacity: 0 }, { opacity: 1, duration: 0.22, ease: "power2.out" }, 0.08)
        .fromTo(botBlock, { opacity: 0 }, { opacity: 1, duration: 0.22, ease: "power2.out" }, 0.14)
        .fromTo(topBlock, { x: "-6vw" }, { x: "12vw", duration: 1 }, 0)
        .fromTo(botBlock, { x: "6vw" }, { x: "-12vw", duration: 1 }, 0);
    }, section);
    return () => media.revert();
  }, []);

  return (
    <div
      ref={sectionRef}
      id="title-card"
      style={{
        position: "relative",
        width: "100%",
        height: "100svh",
        overflow: "hidden",
      }}
    >
      {/* ── TOP-LEFT block ── */}
      <div
        ref={topBlockRef}
        style={{
          position: "absolute",
          top: "clamp(0.75rem, 4vh, 3rem)",
          left: 0,
          zIndex: 2,
          userSelect: "none",
          pointerEvents: "none",
          /* bleed left slightly so the composition touches the edge */
          marginLeft: "-1vw",
          opacity: 0,
          willChange: "transform, opacity",
        }}
      >
        <TextBlock flip={false} />
      </div>

      {/* ── BOTTOM-RIGHT block ── */}
      <div
        ref={botBlockRef}
        style={{
          position: "absolute",
          bottom: "clamp(0.75rem, 4vh, 3rem)",
          right: 0,
          zIndex: 2,
          userSelect: "none",
          pointerEvents: "none",
          marginRight: "-1vw",
          opacity: 0,
          willChange: "transform, opacity",
        }}
      >
        <TextBlock flip={false} />
      </div>

    </div>
  );
}
