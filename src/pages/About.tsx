import { useLayoutEffect, useRef } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { floatPostcards } from '../lib/postcardFloat'
import PostcardLoader from '../components/PostcardLoader'
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

export function AboutPhotoCard({ chapter }: { chapter: 'acmw' | 'acmvit' }) {
  return <>
    <figure className={`about_polaroid about_polaroid--${chapter}`}>
      <img src={chapter === 'acmw' ? aboutAcmWImg : aboutAcmVitImg}
        alt={chapter === 'acmw' ? 'ACM-W members group photo' : 'ACM-VIT members group photo'} className="about_polaroid-img" />
    </figure>
    <figcaption className={`about_overlay about_overlay--${chapter}`}>
      <h2 className="about_cardTitle">{chapter === 'acmw' ? 'ABOUT ACM - W' : 'ABOUT ACM - VIT'}</h2>
      <AboutCardBody />
    </figcaption>
  </>;
}

export default function About({ onIntroChange }: { onIntroChange: (complete: boolean) => void }) {
  const root = useRef<HTMLDivElement>(null)

  useLayoutEffect(() => {
    const element = root.current
    const cards = element?.querySelector<HTMLElement>('.about_cards')
    if (!element || !cards) return
    const media = gsap.matchMedia()
    media.add({
      motion: '(prefers-reduced-motion: no-preference)',
      compact: '(max-width: 48rem)',
    }, context => {
      if (!context.conditions?.motion) return
      floatPostcards(cards.querySelectorAll<HTMLElement>('.about_card-wrap'), cards, Boolean(context.conditions.compact))
    }, element)
    return () => media.revert()
  }, [])

  return (
    <div className="about" ref={root}>
      <PostcardLoader onCompleteChange={onIntroChange}>
        <div className="thread-photo"><AboutPhotoCard chapter="acmw" /></div>
        <div className="thread-photo"><AboutPhotoCard chapter="acmvit" /></div>
      </PostcardLoader>
      <div className="about_cards">
        <section id="about" className="about_section">
          <div className="about_card-wrap">
            <div className="about_photo" data-envelope-photo><AboutPhotoCard chapter="acmw" /></div>
          </div>
        </section>

        <section id="about-acm" className="about_section about_section--top">
          <div className="about_card-wrap about_card-wrap--acmvit">
            <div className="about_photo" data-envelope-photo><AboutPhotoCard chapter="acmvit" /></div>
          </div>
        </section>
      </div>
    </div>
  )
}
