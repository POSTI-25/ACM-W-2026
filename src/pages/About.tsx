import { useLayoutEffect, useRef } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import aboutAcmWImg from '../assets/about/about-acm-w.svg'
import aboutAcmVitImg from '../assets/about/about-acm-vit.svg'
import './About.css'

gsap.registerPlugin(ScrollTrigger)

const BODY_PARAGRAPHS = [
  'Presented by ACM-VIT and ACM W-VIT, The Neural Hack is a 36-hour hackathon focused on data-centric machine learning.',
  'Encouraging inclusive participation and empowering diverse voices—especially women in tech—to lead innovation in STEM fields.',
  'Building a community where technical growth, mentorship, collaboration, and leadership thrive.',
] as const

function AboutCardBody() {
  return (
    <div className="about_cardBody">
      {BODY_PARAGRAPHS.map((paragraph) => (
        <p key={paragraph}>{paragraph}</p>
      ))}
    </div>
  )
}

function AboutBackdrop() {
  return <div className="about_backdrop" aria-hidden="true">
    <div className="about_paper-tint" />
    <svg className="about_postmark" data-about-accent viewBox="0 0 500 440" fill="none" focusable="false">
      <circle cx="250" cy="220" r="184" />
      <circle cx="250" cy="220" r="164" strokeDasharray="2 7" />
      <circle cx="250" cy="220" r="132" />
      <text x="250" y="141" textAnchor="middle">ACM-W · VIT</text>
      <path d="m250 162 12 40 40 12-40 12-12 40-12-40-40-12 40-12Z" fill="currentColor" stroke="none" />
      <text x="250" y="307" textAnchor="middle">LET IDEAS TRAVEL</text>
      <path d="M-20 326c68-34 100 34 168 0s100 34 168 0 100 34 204 0M-20 348c68-34 100 34 168 0s100 34 168 0 100 34 204 0M-20 370c68-34 100 34 168 0s100 34 168 0 100 34 204 0" />
    </svg>
    <svg className="about_keepsake" data-about-accent viewBox="0 0 320 390" fill="none" focusable="false">
      <path d="M31 28h258v334H31Z" strokeWidth="12" strokeDasharray="1 19" />
      <path d="M48 45h224v300H48Z" />
      <path d="M61 58h198v274H61Z" strokeDasharray="2 6" />
      <circle cx="160" cy="170" r="65" />
      <path d="M160 115v110m-55-55h110m-94-39 78 78m-78 0 78-78" />
      <path d="m160 136 9 25 25 9-25 9-9 25-9-25-25-9 25-9Z" fill="currentColor" stroke="none" />
      <text x="160" y="277" textAnchor="middle">CURIOUS MINDS</text>
      <text x="160" y="302" textAnchor="middle">BOLD IDEAS</text>
    </svg>
  </div>
}

export default function About() {
  const root = useRef<HTMLDivElement>(null)

  useLayoutEffect(() => {
    const element = root.current
    if (!element) return
    const media = gsap.matchMedia()
    media.add({
      motion: '(prefers-reduced-motion: no-preference)',
      compact: '(max-width: 48rem)',
    }, context => {
      if (!context.conditions?.motion) return
      const compact = Boolean(context.conditions.compact)
      gsap.utils.toArray<SVGElement>('[data-about-accent]', element).forEach((accent, index) => {
        gsap.fromTo(accent, { y: compact ? 24 : 60, rotation: index === 0 ? -12 : 9 }, {
          y: compact ? -30 : -90, rotation: index === 0 ? 4 : -7, ease: 'none',
          scrollTrigger: { trigger: element, start: 'top bottom', end: 'bottom top', scrub: 1.5, invalidateOnRefresh: true },
        })
      })
      element.querySelectorAll<HTMLElement>('.about_card-wrap').forEach((card, index) => {
        // Both photos share one scroll range; the foreground postcard travels
        // farther, like the overlapping archival photos in the reference.
        gsap.fromTo(card, {
          y: () => window.innerHeight * (index === 0 ? (compact ? .2 : .35) : (compact ? .5 : .9)),
          x: 0,
          rotation: 0,
        }, {
          y: () => -window.innerHeight * (index === 0 ? (compact ? .14 : .24) : (compact ? .28 : .42)),
          x: () => (index === 0 ? -1 : 1) * window.innerWidth * (compact ? .004 : .008),
          rotation: index === 0 ? -1.5 : 1.5,
          ease: 'none',
          scrollTrigger: {
            trigger: element,
            start: 'top bottom',
            end: 'bottom top',
            scrub: 1,
            invalidateOnRefresh: true,
            onToggle: self => {
              card.style.willChange = self.isActive ? 'transform' : 'auto'
            },
          },
        })
      })
      return () => {
        element.querySelectorAll<HTMLElement>('.about_card-wrap').forEach(card => {
          card.style.removeProperty('will-change')
        })
      }
    }, element)
    return () => {
      media.revert()
      element.querySelectorAll<HTMLElement>('.about_card-wrap').forEach(card => {
        card.style.removeProperty('will-change')
      })
    }
  }, [])

  return (
    <div className="about" ref={root}>
      <AboutBackdrop />
      <div className="about_cards">
        <section className="about_section">
          <div className="about_card-wrap">
            <figure className="about_polaroid about_polaroid--acmw">
              <img src={aboutAcmWImg} alt="ACM-W members group photo" className="about_polaroid-img" />
            </figure>
            <figcaption className="about_overlay about_overlay--acmw">
              <h2 className="about_cardTitle">ABOUT ACM - W</h2>
              <AboutCardBody />
            </figcaption>
          </div>
        </section>

        <section id="about-acm" className="about_section about_section--top">
          <div className="about_card-wrap about_card-wrap--acmvit">
            <figure className="about_polaroid about_polaroid--acmvit">
              <img src={aboutAcmVitImg} alt="ACM-VIT members group photo" className="about_polaroid-img" />
            </figure>
            <figcaption className="about_overlay about_overlay--acmvit">
              <h2 className="about_cardTitle">ABOUT ACM - VIT</h2>
              <AboutCardBody />
            </figcaption>
          </div>
        </section>
      </div>
    </div>
  )
}
