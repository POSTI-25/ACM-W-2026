import { useId, useLayoutEffect, useRef } from 'react';
import gsap from 'gsap';
import postcard from '../assets/landing-postcard.svg';
import interior from '../assets/footer/envelopeInterior.png';
import pocket from '../assets/footer/envelopePocket.png';
import insideFlap from '../assets/footer/insideFlap.png';
import outsideFlap from '../assets/footer/outsideFlap.png';
import './PostcardLoader.css';

/** The footer's layered pocket / hinged flap, played as an opening sequence. */
export default function PostcardLoader() {
  const root = useRef<HTMLDivElement>(null);
  const animation = useRef<gsap.core.Timeline | null>(null);
  const writingId = useId().replace(/:/g, '');

  useLayoutEffect(() => {
    const stage = root.current;
    if (!stage) return;
    let alive = true;
    const media = gsap.matchMedia();
    media.add({ reduced: '(prefers-reduced-motion: reduce)', motion: '(prefers-reduced-motion: no-preference)' }, context => {
      const reduced = Boolean(context.conditions?.reduced);
      const select = gsap.utils.selector(stage);
      const letter = select('.landing-letter');
      const shell = select('.landing-envelope, .landing-pocket, .landing-flap-frame');
      const flap = select('.landing-flap');
      const words = select('[data-ink]');
      const flourishes = Array.from(stage.querySelectorAll<SVGPathElement>('[data-draw]'));
      const details = select('[data-detail]');
      const writing = select('[data-writing]');
      const ui = select('.landing-actions');
      flourishes.forEach((node: SVGPathElement) => {
        const length = node.getTotalLength();
        gsap.set(node, { strokeDasharray: length, strokeDashoffset: reduced ? 0 : length });
      });
      if (reduced) {
        gsap.set(shell, { autoAlpha: 0 });
        gsap.set([letter, words, details, ui], { autoAlpha: 1, clearProps: 'transform' });
        gsap.set(writing, { attr: { width: 200 } });
        return;
      }
      const tl = gsap.timeline({ paused: true, defaults: { ease: 'power3.inOut' } });
      animation.current = tl;
      tl.set(letter, { scale: .61, yPercent: 21, rotation: 0, autoAlpha: 1, willChange: 'transform' })
        .set(shell, { autoAlpha: 1, yPercent: 18, scale: .98, willChange: 'transform, opacity' })
        .set(select('.landing-flap-frame'), { zIndex: 4 })
        .set(flap, { rotationX: 180 })
        .set(words, { opacity: 0, y: 7 })
        .set(details, { opacity: 0 })
        .set(writing, { attr: { width: 0 } })
        .set(ui, { opacity: 0, y: 8 })
        .to(shell, { yPercent: 0, scale: 1, duration: .75, ease: 'power2.out' }, 0)
        // Change stacking only while the flap is edge-on: no visible pop.
        .to(flap, { rotationX: 90, duration: .55, ease: 'power2.in' }, .5)
        .set(select('.landing-flap-frame'), { zIndex: 1 }, 1.05)
        .to(flap, { rotationX: 0, duration: .65, ease: 'power2.out' }, 1.05)
        .to(letter, { yPercent: -47, rotation: -3, duration: 1.45 }, 1.35)
        // The letter clears the pocket before the envelope drops away.
        .to(shell, { yPercent: 145, autoAlpha: 0, duration: 1.25, ease: 'power2.in' }, 2.45)
        .to(letter, { yPercent: 0, scale: 1, rotation: 0, duration: 1.65, ease: 'power3.out' }, 2.8)
        .to(words, { opacity: 1, y: 0, stagger: .12, duration: .75, ease: 'power2.out' }, 3.45)
        .to(writing, { attr: { width: 200 }, stagger: .55, duration: .85, ease: 'sine.inOut' }, 3.65)
        .to(flourishes, { strokeDashoffset: 0, stagger: .15, duration: 1, ease: 'sine.inOut' }, 3.7)
        .to(details, { opacity: 1, stagger: .12, duration: .75 }, 4.1)
        .to(ui, { opacity: 1, y: 0, duration: .65 }, 4.55)
        .set([letter, shell], { clearProps: 'willChange' });
      // Decode before the first frame; a cold image load must not interrupt the fold.
      void Promise.all(Array.from(stage.querySelectorAll('img')).map(img => img.decode().catch(() => undefined)))
        .then(() => { if (alive && animation.current === tl) tl.play(0); });
      return () => { tl.kill(); if (animation.current === tl) animation.current = null; };
    }, stage);
    return () => { alive = false; media.revert(); };
  }, []);

  return <div ref={root} className="landing-intro">
    <div className="landing-scene" role="img" aria-label="A burgundy envelope opens and a postcard rises out. Welcome to ACM-W VIT. A place for curious minds, bold ideas, and women who build.">
      <div className="landing-envelope" aria-hidden="true">
        <img className="landing-interior" src={interior} alt="" draggable={false}/>
      </div>
      <div className="landing-flap-frame" aria-hidden="true">
        <div className="landing-flap"><img className="landing-flap-inside" src={insideFlap} alt="" draggable={false}/><img className="landing-flap-outside" src={outsideFlap} alt="" draggable={false}/></div>
      </div>
      <div className="landing-letter" aria-hidden="true">
        <img className="landing-letter-art" src={postcard} alt="" draggable={false}/>
        <svg className="landing-letter-ink" viewBox="0 0 481.649 342.506" fill="none">
          <defs>
            <clipPath id={`${writingId}-welcome`}><rect data-writing x="262" y="160" width="200" height="27"/></clipPath>
            <clipPath id={`${writingId}-name`}><rect data-writing x="262" y="184" width="200" height="27"/></clipPath>
          </defs>
          <g fill="currentColor">
            <text data-detail x="26" y="35" className="landing-small">A LITTLE LETTER. A WORLD OF POSSIBILITY.</text>
            <text data-ink x="26" y="100" className="landing-quote">Curious minds.</text>
            <text data-ink x="26" y="129" className="landing-quote">Fearless futures.</text>
            <text data-ink x="27" y="163" className="landing-note">A place to learn,</text>
            <text data-ink x="27" y="182" className="landing-note">belong &amp; build.</text>
            <text clipPath={`url(#${writingId}-welcome)`} x="266" y="182" className="landing-welcome">welcome to</text>
            <text clipPath={`url(#${writingId}-name)`} x="266" y="204" className="landing-welcome landing-welcome--name">acm-w ♡</text>
            <text data-ink x="267" y="227" className="landing-address">VIT · VELLORE</text>
            <text data-detail x="267" y="249" className="landing-address">WITH CURIOSITY, ALWAYS.</text>
            <text data-detail x="27" y="315" className="landing-small">SIGNED, THE WOMEN WHO BUILD.</text>
          </g>
          <g stroke="currentColor" strokeLinecap="round" strokeLinejoin="round">
            <path data-draw d="M27 140 Q96 146 188 138" strokeWidth=".8"/>
            <path data-draw d="M42 257 C77 212 119 281 166 226 C178 211 192 209 206 215 M181 217 L208 215 L196 235 L192 222 L181 217 L187 231 L192 222" strokeWidth="1.1"/>
            <path data-draw d="M39 218 L39 230 M33 224 L45 224 M166 267 L166 277 M161 272 L171 272 M108 209 L108 217 M104 213 L112 213" strokeWidth="1"/>
            <g data-detail opacity=".65"><circle cx="330" cy="80" r="29" strokeWidth=".6"/><circle cx="330" cy="80" r="25" strokeWidth=".4"/><path d="M355 69 Q371 61 387 69 M356 77 Q372 69 388 77 M356 85 Q372 77 388 85" strokeWidth=".7"/></g>
          </g>
          <g data-detail fill="currentColor" textAnchor="middle"><text x="330" y="77" className="landing-postmark">ACM-W</text><text x="330" y="88" className="landing-postmark">VIT CHAPTER</text></g>
        </svg>
      </div>
      <div className="landing-pocket" aria-hidden="true"><div><img src={pocket} alt="" draggable={false}/></div></div>
    </div>
    <div className="landing-actions"><a href="#about">Discover our chapter <span aria-hidden="true">↓</span></a><button type="button" onClick={() => animation.current?.restart()}>Replay opening <span aria-hidden="true">↺</span></button></div>
  </div>;
}
