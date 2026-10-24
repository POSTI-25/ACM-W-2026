import quill from '../assets/decor/black-feather.svg';
import { Orbit, Plane, SealedLetter, Spark } from './ChapterJourney';

/** Reuse the existing Events artwork behind the Blogs title and stamps. */
export default function BlogTransitionArt() {
  return <>
    <div className="blog-transition-art blog-transition-art--letter" data-blog-art data-depth=".7" data-tilt="-16">
      <SealedLetter />
    </div>
    <div className="blog-transition-art blog-transition-art--orbit" data-blog-art data-depth=".35" data-tilt="12">
      <Orbit />
    </div>
    <div className="blog-transition-art blog-transition-art--quill" data-blog-art data-depth="1" data-tilt="17">
      <img src={quill} alt="" />
    </div>
    <div className="blog-transition-art blog-transition-art--plane" data-blog-art data-depth=".65" data-tilt="9">
      <Plane />
    </div>
    <div className="blog-transition-art blog-transition-art--spark" data-blog-art data-depth=".5" data-tilt="-8">
      <Spark />
    </div>
  </>;
}
