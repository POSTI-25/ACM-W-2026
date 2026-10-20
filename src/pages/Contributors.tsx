import { useLayoutEffect, useRef, useState } from 'react';
import { useReveal } from '../lib/useReveal';
import cardBg from "../assets/optimized/contributors-ContributorsPostcard.webp";

import githubIcon from "../assets/optimized/teams-github.webp";
import linkedinIcon from "../assets/optimized/teams-linkedin.webp";
import leftArr from "../assets/leftArr.png";
import rightArr from "../assets/rightArr.png";
import tamanna from "../assets/optimized/contributors-tamanna.webp";
import maitri from "../assets/optimized/contributors-maitri.webp";
import ishita from "../assets/optimized/contributors-ishita.webp";
import nitu from "../assets/optimized/contributors-nitu.webp";
import jahnavi from "../assets/optimized/contributors-jahnavi.webp";
import sudiksha from "../assets/optimized/contributors-sudiksha.webp";
import chinmayee from "../assets/optimized/contributors-chinmayee.webp";
import ananya from "../assets/optimized/contributors-ananya.webp";
import nimesha from "../assets/optimized/contributors-nimesha.webp";

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


function ContributorCard({contributor}:{contributor:Contributor}) {
  const [flipped,setFlipped]=useState(false);
  const front=useRef<HTMLButtonElement>(null);
  const wasFlipped=useRef(false);
  useLayoutEffect(()=>{if(!flipped&&wasFlipped.current)front.current?.focus();wasFlipped.current=flipped;},[flipped]);
  return <article className="contributor-card" data-reveal onKeyDown={event=>{if(event.key==='Escape')setFlipped(false);}}>
    <div className={`contributor-card__inner ${flipped?'is-flipped':''}`}>
      <button ref={front} type="button" className="contributor-front" style={{backgroundImage:`url("${cardBg}")`}} onClick={()=>setFlipped(true)} inert={flipped} aria-hidden={flipped} aria-label={`Read about ${contributor.name}`} aria-expanded={flipped}>
        <img src={imageMap[contributor.imageSrc]} alt="" loading="lazy" decoding="async"/><span>{contributor.name}</span><small>A LITTLE ABOUT ME ↗</small>
      </button>
      <div className="contributor-back" inert={!flipped} aria-hidden={!flipped}>
        <p className="eyebrow">A NOTE FROM</p><h3>{contributor.name}</h3><p className="contributor-bio">{contributor.bio}</p>
        <div className="contributor-socials">{[contributor.primaryLink,contributor.secondaryLink].filter(link=>link?.href&&link.href!=='#').map(link=>link&&<a href={link.href} key={link.label} target="_blank" rel="noopener noreferrer" aria-label={`${contributor.name} ${link.label}`}><img src={link.iconSrc} alt=""/></a>)}</div>
        <button className="text-link" type="button" onClick={()=>setFlipped(false)}>Back to portrait ↶</button>
      </div>
    </div>
  </article>;
}
export default function ContributorsSection() {
  const root=useReveal();
  const strip=useRef<HTMLDivElement>(null);
  const move=(direction:number)=>strip.current?.scrollBy({left:direction*280,behavior:matchMedia('(prefers-reduced-motion: reduce)').matches?'instant':'smooth'});
  return <div className="contributors-section" ref={root}>
    <div className="section-shell contributors-heading" data-reveal><p className="eyebrow">07 / THE HANDS THAT MADE THIS</p><h2>A little code.<br/><em>A lot of heart.</em></h2><p className="section-deck">Meet the contributors behind this corner of the internet.</p></div>
    <div className="contributor-strip" ref={strip} role="region" aria-label="Website contributors" tabIndex={0}><div className="contributor-track">{contributors.map(contributor=><ContributorCard key={contributor.name} contributor={contributor}/>)}</div></div>
    <div className="editorial-controls"><button type="button" className="round-arrow" aria-label="Previous contributors" onClick={()=>move(-1)}><img src={leftArr} alt=""/></button><span className="eyebrow">TURN A CARD · MEET A MAKER</span><button type="button" className="round-arrow" aria-label="Next contributors" onClick={()=>move(1)}><img src={rightArr} alt=""/></button></div>
  </div>;
}
