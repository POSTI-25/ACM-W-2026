import aboutAcmWImg from '../assets/optimized/about-acm-w.webp';
import aboutAcmVitImg from '../assets/optimized/about-acm-vit.webp';
import { useReveal } from '../lib/useReveal';
import './About.css';

export default function About() {
  const root = useReveal();
  return <div className="about section-shell" ref={root}>
    <div className="section-intro" data-reveal>
      <p className="eyebrow">01 / THE CHAPTER</p>
      <h2>A place to belong.<br /><em>A space to become.</em></h2>
      <p className="section-deck">A shared curiosity for technology. A community that helps you find your voice.</p>
    </div>
    <div className="about-story">
      <figure className="about-photo about-photo--first" data-reveal>
        <img src={aboutAcmWImg} width={1440} height={1002} loading="lazy" decoding="async" alt="ACM-W VIT members together" />
        <figcaption>Different stories. One community.</figcaption>
      </figure>
      <div className="about-copy" data-reveal>
        <span className="postmark" aria-hidden="true">ACM-W VIT<br />WITH LOVE</span>
        <p className="eyebrow">WOMEN IN COMPUTING</p>
        <h3>More than a chapter.</h3>
        <p>We’re ACM-W VIT: a community encouraging women to explore, create, and lead in computing.</p>
        <p>Through technical growth, mentorship, and collaboration, we make room for diverse voices and the ideas they bring.</p>
        <a className="text-link" href="#events">Discover what we do <span aria-hidden="true">↗</span></a>
      </div>
    </div>
    <div className="about-story about-story--reverse" id="about-acm" tabIndex={-1}>
      <figure className="about-photo about-photo--second" data-reveal>
        <img src={aboutAcmVitImg} width={1440} height={1011} loading="lazy" decoding="async" alt="ACM-VIT chapter members" />
        <figcaption>Better ideas happen together.</figcaption>
      </figure>
      <div className="about-copy" data-reveal>
        <p className="eyebrow">OUR EXTENDED FAMILY</p>
        <h3>Connected by curiosity.</h3>
        <p>Alongside ACM-VIT, we bring students together to learn, build, and exchange ideas.</p>
        <p>From speaker sessions to overnight hackathons, our community grows through the things we make together.</p>
      </div>
    </div>
    <div className="chapter-divider" aria-hidden="true"><span>✳</span><span>A LITTLE CURIOSITY GOES A LONG WAY</span><span>✳</span></div>
  </div>;
}
