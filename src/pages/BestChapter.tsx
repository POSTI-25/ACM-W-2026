import PaperPlaneAnimation from "../components/PaperPlaneAnimation";
import "./BestChapter.css";

export default function BestChapter() {
  return (
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
  );
}
