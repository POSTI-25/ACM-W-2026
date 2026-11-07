import { useState, useRef, useEffect } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import "./Contributors.css";
import VintageFilmReel from '../components/VintageFilmReel';

import githubIcon from "../assets/teams/github.png";
import linkedinIcon from "../assets/teams/linkedin.png";
import tamanna from "../assets/contributors/tamanna.png";
import maitri from "../assets/contributors/maitri.png";
import ishita from "../assets/contributors/ishita.png";
import nitu from "../assets/contributors/nitu.png";
import jahnavi from "../assets/contributors/jahnavi.png";
import sudiksha from "../assets/contributors/sudiksha.png";
import chinmayee from "../assets/contributors/chinmayee.png";
import ananya from "../assets/contributors/ananya.png";
import nimesha from "../assets/contributors/nimesha.png";

gsap.registerPlugin(ScrollTrigger);

const imageMap = {
  ananya, chinmayee, jahnavi, nimesha, nitu, sudiksha, maitri, tamanna, ishita,
};

type ImageKey = keyof typeof imageMap;

type SocialLink = {
  href?: string;
  iconSrc: string;
  label: string;
};

type Contributor = {
  name: string;
  imageSrc: ImageKey;
  bio: string;
  primaryLink?: SocialLink;
  secondaryLink?: SocialLink;
};

const contributors: Contributor[] = [
  {
    name: "Aribam Tamanna Sharma",
    imageSrc: "tamanna",
    bio: "Do your best in everything. No matter the outcome, you will always be proud that you gave it your all.",
    primaryLink: {
      href: "https://github.com/A-Taman",
      iconSrc: githubIcon,
      label: "GitHub",
    },
    secondaryLink: {
      href: "https://www.linkedin.com/in/aribam-tamanna-sharma?utm_source=share_via&utm_content=profile&utm_medium=member_android",
      iconSrc: linkedinIcon,
      label: "LinkedIn",
    },
  },
  {
    name: "Maitri Shah",
    imageSrc: "maitri",
    bio: "Built the auth system & API layer.",
    primaryLink: {
      href: "https://github.com/Maitri-shah29",
      iconSrc: githubIcon,
      label: "GitHub",
    },
    secondaryLink: {
      href: "https://www.linkedin.com/in/maitri-shah29",
      iconSrc: linkedinIcon,
      label: "LinkedIn",
    },
  },
  {
    name: "Ishita Joshi",
    imageSrc: "ishita",
    bio: "Have courage and be kind - Cinderella",
    primaryLink: {
      href: "https://github.com/Ishitajoshii",
      iconSrc: githubIcon,
      label: "GitHub",
    },
    secondaryLink: {
      href: "https://www.linkedin.com/in/ishita-joshi7/",
      iconSrc: linkedinIcon,
      label: "LinkedIn",
    },
  },
  {
    name: "Nitu S U",
    imageSrc: "nitu",
    bio: "You can't go back and change the beginning, but you can start where you are and change the ending",
    primaryLink: {
      href: "https://github.com/nitusuu",
      iconSrc: githubIcon,
      label: "GitHub",
    },
    secondaryLink: {
      href: "https://www.linkedin.com/in/nitu-s-u-7643b5321/",
      iconSrc: linkedinIcon,
      label: "LinkedIn",
    },
  },
  {
    name: "Jahnavi Singh",
    imageSrc: "jahnavi",
    bio: "Built the auth system & API layer.",
    primaryLink: {
      href: "https://github.com/POSTI-25",
      iconSrc: githubIcon,
      label: "GitHub",
    },
    secondaryLink: {
      href: "https://www.linkedin.com/in/jahnavisingh512/",
      iconSrc: linkedinIcon,
      label: "LinkedIn",
    },
  },
  {
    name: "Sudiksha Kathuria",
    imageSrc: "sudiksha",
    bio: "For the hope of it all",
    primaryLink: {
      href: "https://github.com/sudiksha-kathuria",
      iconSrc: githubIcon,
      label: "GitHub",
    },
    secondaryLink: {
      href: "https://www.linkedin.com/in/sudiksha-kathuria/",
      iconSrc: linkedinIcon,
      label: "LinkedIn",
    },
  },
  {
    name: "Chinmayee Badiger",
    imageSrc: "chinmayee",
    bio: "Built the auth system & API layer.",
    primaryLink: {
      href: "https://github.com/chinmayeebadiger",
      iconSrc: githubIcon,
      label: "GitHub",
    },
    secondaryLink: {
      href: "https://www.linkedin.com/in/chinmayee-badiger-2111a1326/",
      iconSrc: linkedinIcon,
      label: "LinkedIn",
    },
  },
  {
    name: "Ananya Bisht",
    imageSrc: "ananya",
    bio: "It always seems impossible until it's done",
    primaryLink: {
      href: "https://github.com/ananyab1404",
      iconSrc: githubIcon,
      label: "GitHub",
    },
    secondaryLink: {
      href: "https://www.linkedin.com/in/ananya-bisht-a27036367/",
      iconSrc: linkedinIcon,
      label: "LinkedIn",
    },
  },
  {
    name: "Nimesha Subramanian",
    imageSrc: "nimesha",
    bio: "Built the auth system & API layer.",
    primaryLink: {
      href: "https://github.com/nimeshas",
      iconSrc: githubIcon,
      label: "GitHub",
    },
    secondaryLink: {
      href: "https://www.linkedin.com/in/nimeshas",
      iconSrc: linkedinIcon,
      label: "LinkedIn",
    },
  },
];

function ContributorCard({ contributor }: { contributor: Contributor }) {
  const [flipped, setFlipped] = useState(false);

  return (
    <div className="contributor-polaroid" style={{ perspective: "900px" }}
      role="group" aria-label={contributor.name}>
      <div
        style={{
          position: "relative",
          width: "100%",
          height: "100%",
          transformStyle: "preserve-3d",
          transition: "transform 0.55s cubic-bezier(0.4, 0, 0.2, 1)",
          transform: flipped ? "rotateY(180deg)" : "rotateY(0deg)",
        }}
      >
        {/* ── FRONT ── */}
        <div
          onClick={() => setFlipped(true)}
          role="button" tabIndex={flipped ? -1 : 0} aria-label={`About ${contributor.name}`}
          onKeyDown={e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); setFlipped(true); } }}
          style={{
            ...faceBase,
            cursor: "pointer",
            pointerEvents: flipped ? "none" : "auto",
          }}
        >
          <div
            style={{
              position: "relative",
              zIndex: 1,
              width: "100%",
              height: "100%",
              display: "flex",
              flexDirection: "column",
              padding: "12px 12px 0px 12px",
            }}
          >
            <div style={{ flex: 1, overflow: "hidden", borderRadius: 1 }}>
              <img
                src={imageMap[contributor.imageSrc]}
                alt={contributor.name}
                loading="lazy"
                decoding="async"
                style={{ width: "100%", height: "100%", objectFit: "cover", objectPosition: "top center", display: "block" }}
              />
            </div>
            <div style={{ height: 64, display: "flex", alignItems: "center", justifyContent: "center", padding: "0 4px" }}>
              <span
                style={{
                  fontSize: "clamp(14px, 1.2vw, 18px)",
                  fontWeight: 700,
                  color: "#000000",
                  textAlign: "center",
                  width: "100%",
                  whiteSpace: "nowrap",
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                  fontFamily: "Kovanov, Georgia, serif",
                  letterSpacing: "0.02em",
                }}
              >
                {contributor.name}
              </span>
            </div>
          </div>
        </div>

        {/* ── BACK ── */}
        <div
          onClick={() => setFlipped(false)}
          onKeyDown={e => { if (e.key === 'Escape') setFlipped(false); }}
          style={{
            ...faceBase,
            transform: "rotateY(180deg)",
            cursor: "pointer",
            pointerEvents: flipped ? "auto" : "none",
          }}
        >
          <div
            style={{
              position: "relative",
              zIndex: 2,
              width: "100%",
              height: "100%",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              padding: "20px 16px",
              gap: 10,
            }}
          >
            <p
              style={{
                fontSize: 20,
                fontWeight: 700,
                color: "#000000",
                textAlign: "center",
                margin: 0,
                fontFamily: "Kovanov, Georgia, serif",
                letterSpacing: "0.05em",
              }}
            >
              {contributor.name}
            </p>

            <div style={{ width: 36, height: 1, borderRadius: 1, flexShrink: 0 }} />

            <p
              style={{
                fontSize: 16,
                color: "rgb(0,0,0)",
                textAlign: "center",
                margin: 0,
                lineHeight: 1.6,
                fontFamily: "Kovanov, Georgia, serif",
                fontStyle: "italic",
                flexShrink: 0,
              }}
            >
              {contributor.bio}
            </p>

            <div style={{ display: "flex", gap: 10, marginTop: 6 }}>
              {contributor.primaryLink?.href && (
                <a
                  href={contributor.primaryLink.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={contributor.primaryLink.label}
                  onClick={(e) => e.stopPropagation()}
                  tabIndex={flipped ? 0 : -1}
                  style={iconLinkStyle}
                >
                  <img
                    src={contributor.primaryLink.iconSrc}
                    alt={contributor.primaryLink.label}
                    style={{ width: 40, height: 40, objectFit: "contain" }}
                  />
                </a>
              )}
              {contributor.secondaryLink?.href && (
                <a
                  href={contributor.secondaryLink.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={contributor.secondaryLink.label}
                  onClick={(e) => e.stopPropagation()}
                  tabIndex={flipped ? 0 : -1}
                  style={iconLinkStyle}
                >
                  <img
                    src={contributor.secondaryLink.iconSrc}
                    alt={contributor.secondaryLink.label}
                    style={{ width: 40, height: 40, objectFit: "contain" }}
                  />
                </a>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function ContributorsSection() {
  const sectionRef = useRef<HTMLElement>(null);
  useEffect(() => {
    const section = sectionRef.current;
    if (!section) return;
    const strip = section.querySelector<HTMLElement>('.contributor-film');
    const spool = section.querySelector('.film-spool');
    const counter = section.querySelector('[data-film-counter]');
    if (!strip || !spool) return;
    const media = gsap.matchMedia();
    media.add('(prefers-reduced-motion: no-preference)', () => {
      const timeline = gsap.timeline({ scrollTrigger: {
        trigger: section, start: 'top top', end: 'bottom bottom', scrub: .65,
        invalidateOnRefresh: true,
        onUpdate: self => {
          if (counter) counter.textContent = String(Math.min(contributors.length, 1 + Math.floor(self.progress * contributors.length))).padStart(2, '0');
        },
      } });
      timeline.fromTo(strip, { x: () => innerWidth * .62, rotation: -.8 }, {
        x: () => -strip.scrollWidth + innerWidth * .92, rotation: .8,
        duration: 1, ease: 'none',
      }, 0).fromTo(spool, { rotation: 0 }, { rotation: -720, duration: 1, ease: 'none' }, 0);
    }, section);
    return () => media.revert();
  }, []);
  return <section ref={sectionRef} id="contributors-film" className="contributors-collection" aria-label="Website contributors film reel">
    <div className="contributor-film-stage">
      <div className="film-caption"><span>THE PEOPLE IN THE FRAME</span><span><b data-film-counter>01</b> / 09</span></div>
      <div className="film-window" tabIndex={0} aria-label="Contributor photographs. Scroll to unroll; select a portrait to read about them.">
        <div className="contributor-film">
          <div className="film-leader" aria-hidden="true"><span>ACM-W / OUR PEOPLE</span></div>
          {contributors.map((c, index) => <div className="contributor-slot" key={c.name}>
            <span className="film-frame-number" aria-hidden="true">ACM-W / {String(index + 1).padStart(2, '0')}</span>
            <ContributorCard contributor={c} />
          </div>)}
          <div className="film-tail" aria-hidden="true" />
        </div>
      </div>
      <div className="film-spool" aria-hidden="true"><VintageFilmReel /></div>
      <p className="film-instruction">Scroll to unroll / select a frame to meet its maker</p>
    </div>
  </section>;
}

const faceBase: React.CSSProperties = {
  position: "absolute",
  inset: 0,
  backfaceVisibility: "hidden",
  WebkitBackfaceVisibility: "hidden",
  overflow: "hidden",
};

const iconLinkStyle: React.CSSProperties = {
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  width: 34,
  height: 34,
  borderRadius: 8,
  textDecoration: "none",
  backdropFilter: "blur(4px)",
};
