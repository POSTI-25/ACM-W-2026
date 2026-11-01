import { useEffect, useLayoutEffect, useRef, useState } from "react";
import type { PointerEvent as ReactPointerEvent } from "react";
import { gsap } from "gsap";
import { blogs } from "../data/blogs";
import { RollingSectionTitle } from "../components/EventsTitle";
import StampBorder from "../components/StampBorder";

export default function BlogStamps() {
  // Seeded from the real viewport so the first layout pass is already
  // correct instead of laying out for 1200×800 and jumping a frame later.
  const [viewport, setViewport] = useState(() =>
    typeof window === "undefined"
      ? { w: 1200, h: 800 }
      : { w: window.innerWidth, h: window.innerHeight }
  );
  const [activeIdx, setActiveIdx] = useState<number | null>(null);
  const [isFlipped, setIsFlipped] = useState(false);
  const [requestedPage, setPage] = useState(0);
  const compact = viewport.w < 768;
  const pageSize = compact ? 4 : 8;
  const pageCount = Math.max(1, Math.ceil(blogs.length/pageSize));
  const page = Math.min(requestedPage, pageCount-1);
  const visible = blogs;
  const n = Math.min(pageSize, blogs.length);
  const order = blogs.map((_, index) => index);
  const cardRefs = useRef<Array<HTMLDivElement | null>>([]);
  const motionRef = useRef({ position: 0 });
  const pagingRef = useRef(false);
  const fanRef = useRef<HTMLDivElement>(null);
  const returningFromZoomRef = useRef(false);
  const suppressClickRef = useRef(false);
  const dragRef = useRef<{
    pointerId: number; startX: number; startY: number;
    lastX: number; lastTime: number; velocity: number; dx: number; locked: boolean;
  } | null>(null);

  useEffect(() => {
    let previousWidth = window.innerWidth;
    const motion = motionRef.current;
    const update = () => {
      if (previousWidth !== window.innerWidth) {
        previousWidth = window.innerWidth;
        setActiveIdx(null);
        setIsFlipped(false);
        cardRefs.current.forEach(card => {
          const inner = card?.querySelector('.stamp-inner');
          if (inner) { gsap.killTweensOf(inner); gsap.set(inner, { rotationY: 0 }); }
        });
      }
      setViewport({ w: window.innerWidth, h: window.innerHeight });
    };
    update();
    window.addEventListener("resize", update);
    return () => {
      window.removeEventListener("resize", update);
      gsap.killTweensOf(motion);
    };
  }, []);

  const cardW = compact
    ? Math.min(viewport.w * .75, viewport.h * .5)
    : Math.min(viewport.w * .34, viewport.h * .58);
  const cardH = cardW * 1.25;
  const angleStep = compact ? 8 : 9.2;
  const radius = cardW * (compact ? .72 : .9);
  const fanPose = (offset: number) => {
    const angle = offset*angleStep;
    const radians = angle*Math.PI/180;
    return {
      angle,
      tx: radius*Math.sin(radians),
      ty: radius*(1-Math.cos(radians)),
      zIndex: Math.abs(angle) < 85 ? 1000+Math.round(angle*10) : 0,
    };
  };
  const getFanProps = (slot: number) => fanPose(slot-(n-1)/2);
  const getCardProps = (index: number, position: number) =>
    fanPose(gsap.utils.wrap(-blogs.length/2, blogs.length/2, index-position-(n-1)/2));
  // Measure the rotated corners, including the lowest outer stamp corners.
  // The old bottom anchor sat below the section and cropped the whole fan.
  const corners = Array.from({ length: n }, (_, slot) => {
    const { angle: degrees, tx, ty } = getFanProps(slot);
    const angle = degrees * Math.PI / 180;
    return [-cardW / 2, cardW / 2].flatMap(x => [-cardH, 0].map(y => ({
      x: tx + x * Math.cos(angle) - y * Math.sin(angle),
      y: ty + x * Math.sin(angle) + y * Math.cos(angle),
    })));
  }).flat();
  const minX = Math.min(...corners.map(p => p.x));
  const maxX = Math.max(...corners.map(p => p.x));
  const minY = Math.min(...corners.map(p => p.y));
  const maxY = Math.max(...corners.map(p => p.y));
  const bottomPadding = Math.max(24, viewport.h * .03);
  const headingFontSize = Math.max(64, Math.min(viewport.w * .14, 190));
  const headingSpace = headingFontSize * 1.24 + (compact ? 120 : 110);
  const scale = viewport.w * 1.01 / (maxX-minX);
  const fanHeight = (maxY - minY) * scale;
  const fanAnchorBottom = bottomPadding + maxY * scale;
  const sectionHeight = Math.max(viewport.h * (compact ? .82 : 1), headingSpace + fanHeight + bottomPadding);
  const headingTop = 20;
  const contentScale = Math.max(0.75, Math.min(1, scale));
  const imageHeight = Math.round(cardH * 0.5 * contentScale);
  const titleSize = 14 * contentScale;
  const authorSize = 10 * contentScale;
  const metaSize = 8 * contentScale;
  const bodySize = 9 * contentScale;
  const linkSize = 10 * contentScale;

  const renderFan = () => {
    cardRefs.current.forEach((card, index) => {
      if (!card) return;
      const { tx, ty, angle, zIndex } = getCardProps(index, motionRef.current.position);
      gsap.set(card, { x: tx, y: ty, rotation: angle, scale: 1, zIndex });
    });
  };

  useLayoutEffect(() => {
    if (activeIdx !== null) { returningFromZoomRef.current = true; return; }
    const returning = returningFromZoomRef.current;
    returningFromZoomRef.current = false;
    gsap.killTweensOf(motionRef.current);
    motionRef.current.position = page*pageSize;
    pagingRef.current = false;
    cardRefs.current.forEach((card, index) => {
      if (!card) return;
      const { tx, ty, angle, zIndex } = getCardProps(index, motionRef.current.position);
      const pose = { x: tx, y: ty, rotation: angle, scale: 1, zIndex };
      if (returning) gsap.to(card, { ...pose, duration: .55, ease: "power3.out", overwrite: true });
      else gsap.set(card, pose);
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeIdx, page, viewport]);

  const zoomCard = (i: number) => {
    const el = cardRefs.current[i];
    if (!el) return;
    visible.forEach((_, j) => {
      const c = cardRefs.current[j];
      if (j === i || !c) return;
      const dir = j < i ? -1 : 1;
      gsap.to(c, {
        x: dir * (viewport.w/scale + cardW*1.5),
        duration: .55,
        ease: "power3.inOut",
      });
    });
    const maxScaleW = (viewport.w * (compact ? 0.8 : 0.72)) / (cardW * scale);
    const maxScaleH = (viewport.h * 0.72) / (cardH * scale);
    const targetScale = Math.min(compact ? 3.2 : 1.4, maxScaleW, maxScaleH);
    const sceneTop = fanRef.current?.closest('.blog-reel')?.getBoundingClientRect().top ?? 0;
    const halfHeight = cardH*targetScale*scale/2;
    const center = gsap.utils.clamp(halfHeight+24, sectionHeight-halfHeight-24, viewport.h/2-sceneTop);
    const targetY = (center-sectionHeight+fanAnchorBottom)/scale+cardH*targetScale/2;
    gsap.to(el, {
      x: 0,
      y: targetY,
      rotation: 0,
      scale: targetScale,
      zIndex: 5000,
      duration: 0.55,
      ease: "back.out(1.4)",
    });
    setActiveIdx(i);
    setIsFlipped(false);
  };

  const flipCard = (i: number) => {
    const inner = cardRefs.current[i]?.querySelector<HTMLDivElement>(
      ".stamp-inner"
    );
    if (!inner) return;
    gsap.to(inner, {
      rotationY: 180,
      duration: 0.65,
      ease: "power2.inOut",
    });
    setIsFlipped(true);
  };

  const closeZoom = () => {
    if (activeIdx === null) return;
    const el = cardRefs.current[activeIdx];
    const inner = el?.querySelector<HTMLDivElement>(".stamp-inner");
    if (inner) {
      gsap.to(inner, { rotationY: 0, duration: 0.4, ease: "power2.inOut" });
    }
    const slot = order.indexOf(activeIdx);
    if (slot < 0) return;
    const { angle, zIndex, tx, ty } = getCardProps(activeIdx, motionRef.current.position);
    gsap.to(el, {
      x: tx,
      y: ty,
      rotation: angle,
      scale: 1,
      zIndex,
      duration: 0.55,
      ease: "back.out(1.4)",
    });
    order.forEach((cardIdx) => {
      const c = cardRefs.current[cardIdx];
      if (!c) return;
      const { angle: oa, zIndex: oz, tx: ox, ty: oy } = getCardProps(cardIdx, motionRef.current.position);
      gsap.to(c, {
        x: ox,
        y: oy,
        rotation: oa,
        zIndex: oz,
        duration: 0.5,
        ease: "power2.out",
      });
    });
    setActiveIdx(null);
    setIsFlipped(false);
  };

  const hoverCard = (cardIdx: number, entering: boolean) => {
    if (activeIdx !== null || pagingRef.current || dragRef.current?.locked) return;
    const el = cardRefs.current[cardIdx];
    const slot = order.indexOf(cardIdx);
    if (!el || slot < 0) return;
    const { ty } = getCardProps(cardIdx, motionRef.current.position);
    gsap.to(el, {
      y: entering ? ty - cardH * 0.05 : ty,
      duration: 0.35,
      ease: "power2.out",
    });
  };

  const hint =
    activeIdx === null
      ? "drag to browse · tap to read"
      : !isFlipped
        ? "tap again"
        : "";

  const handleCardClick = (cardIdx: number) => {
    if (pagingRef.current) return;
    if (activeIdx === null) zoomCard(cardIdx);
    else if (activeIdx === cardIdx) {
      if (!isFlipped) flipCard(cardIdx);
      else closeZoom();
    } else {
      closeZoom();
      setTimeout(() => zoomCard(cardIdx), 420);
    }
  };

  const pagePosition = (nextPage: number, direction?: number) => {
    const base = page*pageSize;
    let target = nextPage*pageSize;
    if (direction === 1 && target <= base) target += blogs.length;
    else if (direction === -1 && target >= base) target -= blogs.length;
    else if (direction === undefined) target = base+gsap.utils.wrap(-blogs.length/2, blogs.length/2, target-base);
    return target;
  };

  const goToPage = (nextPage: number, direction?: number) => {
    if (pagingRef.current || activeIdx !== null || nextPage === page) return;
    pagingRef.current = true;
    gsap.killTweensOf(cardRefs.current.filter(Boolean));
    // All cards turn about one shared pivot. Cards below the hand recycle offscreen.
    gsap.to(motionRef.current, {
      position: pagePosition(nextPage, direction),
      duration: window.matchMedia("(prefers-reduced-motion: reduce)").matches ? 0 : .8,
      ease: "power2.out",
      overwrite: true,
      onUpdate: renderFan,
      onComplete: () => {
        motionRef.current.position = nextPage*pageSize;
        renderFan();
        setPage(nextPage);
        pagingRef.current = false;
      },
    });
  };

  const startDrag = (event: ReactPointerEvent<HTMLDivElement>) => {
    if (!event.isPrimary || event.button !== 0) return;
    suppressClickRef.current = false;
    if (activeIdx !== null || pagingRef.current) return;
    dragRef.current = { pointerId: event.pointerId, startX: event.clientX, startY: event.clientY,
      lastX: event.clientX, lastTime: event.timeStamp, velocity: 0, dx: 0, locked: false };
  };

  const moveDrag = (event: ReactPointerEvent<HTMLDivElement>) => {
    const drag = dragRef.current;
    if (!drag || drag.pointerId !== event.pointerId) return;
    const dx = event.clientX-drag.startX, dy = event.clientY-drag.startY;
    if (!drag.locked) {
      if (Math.abs(dy) > 8 && Math.abs(dy) > Math.abs(dx)) {
        suppressClickRef.current = true;
        dragRef.current = null;
        return;
      }
      if (Math.abs(dx) < 8 || Math.abs(dx) < Math.abs(dy)*1.2) return;
      drag.locked = true;
      suppressClickRef.current = true;
      gsap.killTweensOf(motionRef.current);
      gsap.killTweensOf(cardRefs.current.filter(Boolean));
      event.currentTarget.setPointerCapture(event.pointerId);
      event.currentTarget.classList.add("is-dragging");
    }
    const elapsed = Math.max(1, event.timeStamp-drag.lastTime);
    drag.velocity = .4*drag.velocity+.6*(event.clientX-drag.lastX)/elapsed;
    drag.lastX = event.clientX;
    drag.lastTime = event.timeStamp;
    drag.dx = dx;
    const direction = dx < 0 ? 1 : -1;
    const target = pagePosition((page+direction+pageCount)%pageCount, direction);
    const span = target-page*pageSize;
    const distance = Math.min(Math.abs(span)*.94, Math.abs(dx)/(viewport.w/(pageSize*.9)));
    motionRef.current.position = page*pageSize+direction*distance;
    renderFan();
  };

  const endDrag = (event: ReactPointerEvent<HTMLDivElement>, cancelled = false) => {
    const drag = dragRef.current;
    if (!drag || drag.pointerId !== event.pointerId) return;
    dragRef.current = null;
    event.currentTarget.classList.remove("is-dragging");
    if (event.currentTarget.hasPointerCapture(event.pointerId)) event.currentTarget.releasePointerCapture(event.pointerId);
    if (!drag.locked) return;
    const velocity = event.timeStamp-drag.lastTime < 120 ? drag.velocity : 0;
    const threshold = Math.max(44, Math.min(120, viewport.w*.12));
    const committed = Math.abs(drag.dx) > threshold || (Math.abs(drag.dx) > 18 && Math.abs(velocity) > .45);
    if (!cancelled && committed && pageCount > 1) {
      const dir = drag.dx < 0 ? 1 : -1;
      goToPage((page+dir+pageCount)%pageCount, dir);
    } else {
      gsap.to(motionRef.current, { position: page*pageSize, duration: .45, ease: "power3.out", onUpdate: renderFan, overwrite: true });
    }
  };

  return (
    <div
      className="blog-reel"
      style={{
        width: "100%",
        minHeight: compact ? undefined : "100svh",
        height: sectionHeight,
        background: "#FFF9E9",
        fontFamily: "'Georgia', serif",
        position: "relative",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        overflow: "hidden",
        userSelect: "none",
      }}
    >
      <style>{`
        .blog-reel .events-title { font-size: clamp(64px, 14vw, 190px); }
        .blog-fan-card:focus-visible, .blog-page-number:focus-visible {
          outline: 2px solid #580a0a;
          outline-offset: 6px;
        }
        .blog-fan-surface { touch-action: pan-y; cursor: grab; }
        .blog-fan-surface .blog-fan-card { cursor: inherit; touch-action: pan-y; }
        .blog-fan-surface.is-dragging, .blog-fan-surface.is-dragging * { cursor: grabbing !important; }
        .blog-page-number {
          border: 0; background: none; padding: 0 .65rem; min-width: 44px; min-height: 44px;
          font: inherit; letter-spacing: .08em; color: inherit; cursor: pointer;
          color: #9b7770;
        }
        .blog-page-number:hover, .blog-page-number[aria-current='page'] { color: #580a0a; }
        .blog-page-number[aria-current='page'] { text-decoration: underline; text-underline-offset: .4em; }
        .blog-fan-status { position: absolute; width: 1px; height: 1px; overflow: hidden; clip-path: inset(50%); }
      `}</style>

      <div
        style={{
          position: "absolute",
          top: headingTop,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          zIndex: 30,
          pointerEvents: "none",
          visibility: activeIdx !== null ? "hidden" : "visible",
        }}
      >
        <div>
          <RollingSectionTitle word="BLOGS" sectionId="blogs" staticLetters={2} as="h2" />
        </div>
        <p
          id="blog-fan-hint"
          key={activeIdx === null ? hint : "zoomed"}
          style={{
            margin: "-0.6rem 0 0",
            fontFamily: "Kovanov, serif",
            fontStyle: "normal",
            fontWeight: "bold",
            fontSize: "clamp(1.05rem, 1.5vw, 1.35rem)",
            letterSpacing: "0.05em",
            color: "#580a0a",
          }}
        >
          {activeIdx === null && hint ? hint : " "}
        </p>
        {pageCount > 1 && (
          <nav
            aria-label="Blog postcard groups"
            style={{
              margin: "0.1rem 0 0",
              display: "flex",
              flexWrap: "wrap",
              justifyContent: "center",
              maxWidth: "calc(100vw - 2rem)",
              pointerEvents: activeIdx !== null ? "none" : "auto",
              visibility: activeIdx !== null ? "hidden" : "visible",
              fontFamily: "Kovanov, serif",
              fontWeight: "bold",
              fontSize: "clamp(0.85rem, 1.1vw, 1rem)",
              letterSpacing: "0.16em",
              color: "#580a0a",
            }}
          >
            {Array.from({ length: pageCount }, (_, index) => <button
              key={index}
              type="button"
              className="blog-page-number"
              aria-label={`Postcard group ${index+1}`}
              aria-controls="blog-postcard-fan"
              aria-current={page === index ? "page" : undefined}
              onClick={() => goToPage(index)}
            >{String(index+1).padStart(2, "0")}</button>)}
          </nav>
        )}
      </div>

      {activeIdx !== null && hint && (
        <p
          key={hint}
          style={{
            position: "absolute",
            left: 0,
            right: 0,
            bottom: compact ? 0 : "clamp(1rem, 3vh, 2rem)",
            textAlign: "center",
            margin: 0,
            fontFamily: "Kovanov, serif",
            fontStyle: "normal",
            fontWeight: "bold",
            fontSize: "clamp(1.1rem, 1.6vw, 1.5rem)",
            letterSpacing: "0.08em",
            color: "#580a0a",
            zIndex: 30,
            pointerEvents: "none",
          }}
        >
          {hint}
        </p>
      )}

      {activeIdx !== null && (
        <div
          onClick={() => closeZoom()}
          style={{
            position: "absolute",
            inset: 0,
            background: "rgba(50,14,14,0.15)",
            zIndex: 10,
          }}
        />
      )}

      <div
        id="blog-postcard-fan"
        ref={fanRef}
        className="blog-fan-surface"
        role="group"
        aria-label="Blog postcards"
        aria-describedby="blog-fan-hint"
        onPointerDown={startDrag}
        onPointerMove={moveDrag}
        onPointerUp={event => endDrag(event)}
        onPointerCancel={event => endDrag(event, true)}
        onLostPointerCapture={event => endDrag(event, true)}
        onClickCapture={event => {
          if (suppressClickRef.current && event.detail !== 0) {
            event.preventDefault();
            event.stopPropagation();
          }
        }}
        style={{
          position: "absolute",
          bottom: fanAnchorBottom,
          left: 0,
          right: 0,
          height: fanHeight,
          pointerEvents: activeIdx === null ? "auto" : "none",
          zIndex: 20,
        }}
      >
        <div style={{ position: "absolute", bottom: 0, left: "50%", width: 0, height: 0,
          transform: `scale(${scale})`, transformOrigin: "bottom center" }}>
          {blogs.map((blog, cardIdx) => {
            const pose = getCardProps(cardIdx, page*pageSize);
            const inHand = Math.abs(pose.angle) <= (n-1)*angleStep/2+.1;
            return (
              <div
                key={blog.id}
                className="blog-fan-card"
                data-card-index={cardIdx}
                aria-hidden={Math.abs(pose.angle) > 90}
                inert={activeIdx !== null && activeIdx !== cardIdx}
                role="button"
                tabIndex={activeIdx !== null ? (activeIdx === cardIdx ? 0 : -1) : (inHand ? 0 : -1)}
                aria-label={`Read ${blog.title}`}
                ref={(el) => {
                  cardRefs.current[cardIdx] = el;
                }}
                onClick={(e) => {
                  e.stopPropagation();
                  handleCardClick(cardIdx);
                }}
                onKeyDown={(e) => {
                  if (e.target !== e.currentTarget) return;
                  if (e.key === "Enter" || e.key === " ") {
                    e.preventDefault();
                    handleCardClick(cardIdx);
                  } else if (e.key === "Escape") {
                    closeZoom();
                  }
                }}
                onMouseEnter={() => hoverCard(cardIdx, true)}
                onMouseLeave={() => hoverCard(cardIdx, false)}
                style={{
                  position: "absolute",
                  width: cardW,
                  height: cardH,
                  bottom: 0,
                  left: -cardW / 2,
                  transformOrigin: "bottom center",
                  cursor: activeIdx === null ? undefined : "pointer",
                  pointerEvents: Math.abs(pose.angle) > 90 || (activeIdx !== null && activeIdx !== cardIdx) ? "none" : "all",
                }}
              >
                <div
                  className="stamp-inner"
                  style={{
                    position: "relative",
                    width: "100%",
                    height: "100%",
                    transformStyle: "preserve-3d",
                    perspective: "56rem",
                  }}
                >
                  <div
                    style={{
                      position: "absolute",
                      inset: 0,
                      backfaceVisibility: "hidden",
                    }}
                  >
                    <StampBorder>
                      <div
                        style={{
                          display: "flex",
                          flexDirection: "column",
                          width: "100%",
                          height: "100%",
                          overflow: "hidden",
                        }}
                      >
                        <img
                          src={blog.image}
                          alt={blog.title}
                          decoding="async"
                          style={{
                            width: "100%",
                            height: imageHeight,
                            objectFit: "cover",
                          }}
                          draggable={false}
                        />
                        <div
                          style={{
                            display: "flex",
                            flexDirection: "column",
                            flex: 1,
                            padding: "2.2% 2.2% 1.7%",
                            textAlign: "center",
                          }}
                        >
                          <div
                            style={{
                              display: "flex",
                              flexDirection: "column",
                              alignItems: "center",
                              justifyContent: "center",
                              textAlign: "center",
                              flex: 1,
                              gap: "2%",
                            }}
                          >
                            <p
                              style={{
                                textAlign: "center",
                                fontWeight: "bold",
                                fontSize: titleSize,
                                color: "#3a1212",
                                lineHeight: 1.3,
                                margin: 0,
                              }}
                            >
                              {blog.title}
                            </p>
                            <p
                              style={{
                                textAlign: "center",
                                fontStyle: "italic",
                                fontSize: authorSize,
                                color: "#6b1a1a",
                                margin: 0,
                              }}
                            >
                              By: {blog.author}
                            </p>
                          </div>
                          <div
                            style={{
                              display: "flex",
                              justifyContent: "space-between",
                              width: "100%",
                              paddingTop: "1.2%",
                              fontSize: metaSize,
                              color: "#8b4040",
                              borderTop: "0.5px solid #c8a090",
                            }}
                          >
                            <span>{blog.date}</span>
                            <span>{blog.read}</span>
                          </div>
                        </div>
                      </div>
                    </StampBorder>
                  </div>
                  <div
                    style={{
                      position: "absolute",
                      inset: 0,
                      backfaceVisibility: "hidden",
                      transform: "rotateY(180deg)",
                    }}
                  >
                    <StampBorder>
                      <div
                        style={{
                          display: "flex",
                          flexDirection: "column",
                          width: "100%",
                          height: "100%",
                          padding: "2.8% 2.2% 2.2%",
                          boxSizing: "border-box",
                        }}
                      >
                        <p
                          style={{
                            textAlign: "center",
                            fontWeight: "bold",
                            fontSize: titleSize,
                            color: "#3a1212",
                            margin: "0 0 1.7%",
                          }}
                        >
                          {blog.title}
                        </p>
                        <p
                          style={{
                            flex: 1,
                            overflow: "hidden",
                            fontFamily: "Quicksand, Arial, sans-serif",
                            fontWeight: 400,
                            fontSize: bodySize,
                            color: "#3a1212",
                            lineHeight: 1.55,
                            margin: 0,
                          }}
                        >
                          {blog.body}
                        </p>
                        <a
                          tabIndex={activeIdx === cardIdx && isFlipped ? 0 : -1}
                          href={blog.link}
                          target="_blank"
                          rel="noreferrer"
                          onClick={(e) => e.stopPropagation()}
                          style={{
                            textAlign: "center",
                            textDecoration: "underline",
                            marginTop: "2.2%",
                            display: "block",
                            fontSize: linkSize,
                            color: "#6b1a1a",
                          }}
                        >
                          Read more -&gt;
                        </a>
                      </div>
                    </StampBorder>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
      <span className="blog-fan-status" aria-live="polite" aria-atomic="true">
        Postcard group {page+1} of {pageCount}
      </span>
    </div>
  );
}
