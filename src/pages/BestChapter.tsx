import PaperPlaneAnimation from '../components/PaperPlaneAnimation';
import { useReveal } from '../lib/useReveal';
export default function BestChapter() {
  const root=useReveal();
  return <div ref={root} className="award-section">
    <PaperPlaneAnimation />
    <div className="award-circle" data-reveal>
      <p className="eyebrow">03 / A MOMENT TO REMEMBER</p>
      <span className="award-star" aria-hidden="true">✳</span>
      <h2>Best Emerging<br/><em>Chapter.</em></h2>
      <p>RECOGNISED BY ACM INDIA</p>
      <span aria-hidden="true">—</span>
    </div>
    <p className="award-caption">A little recognition for a community<br/>with a lot of heart.</p>
  </div>;
}
