import { useEffect, useState } from "react";
import EnvelopeMenu from "./EnvelopeMenu";
import EnvelopeFooter from './components/EnvelopeFooter';
import MobileEnvelopeNavbar from "./components/MobileEnvelopeNavbar";
import PostcardLoader from "./components/PostcardLoader";
import About from "./pages/About";
import BlogStamps from "./pages/BlogStamps";
import ContributorsSection from "./pages/Contributors";
import Events from "./pages/Events";
import BestChapter from "./pages/BestChapter";
import TeamPage from "./pages/TeamPage";
import WomenJourney from "./components/WomenJourney";
import Footer from "./components/Footer";
import SectionColorFan from "./components/SectionColorFan";
import ChapterJourney, { ChapterTrail } from "./components/ChapterJourney";

import "./App.css";

function GlobalNavbar() {
  const [showNavbar, setShowNavbar] = useState(false);

  useEffect(() => {
    let frameId: number | null = null;
    let currentShowNavbar = false;

    const updateNavbarVisibility = () => {
      frameId = null;
      const nextShowNavbar = window.scrollY > window.innerHeight * 0.5;
      if (nextShowNavbar !== currentShowNavbar) {
        currentShowNavbar = nextShowNavbar;
        setShowNavbar(nextShowNavbar);
      }
    };

    const handleScroll = () => {
      if (frameId === null) {
        frameId = window.requestAnimationFrame(updateNavbarVisibility);
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    updateNavbarVisibility();

    return () => {
      window.removeEventListener('scroll', handleScroll);
      if (frameId !== null) window.cancelAnimationFrame(frameId);
    };
  }, []);

  return (
    <div
      className={`desktop-envelope-navbar ${
        showNavbar ? 'is-visible' : ''
      }`}
    >
      {showNavbar && <EnvelopeMenu />}
    </div>
  );
}

/*
 * One continuous document. Every section sits in normal flow with no
 * z-index stacking and no GSAP pinning, so the page height is final on
 * first paint and nothing slides over anything else. The two scroll-driven
 * scenes (the globe and the envelope) use native `position: sticky`
 * inside their own sections instead of pin-spacers.
 *
 * `overflow-x: clip` (not `hidden`) is load-bearing: `hidden` would turn
 * <main> into a scroll container and break every sticky descendant.
 */
export default function App() {
  return (
    <main className="site-main relative bg-[#fff9e9]">
      <GlobalNavbar />
      <MobileEnvelopeNavbar />

      <section id="home" className="fullscreen-lottie">
        <PostcardLoader />
      </section>

      <ChapterJourney>
        <section id="about">
          <About />
        </section>

        <section id="events">
          <Events />
        </section>
      </ChapterJourney>

      <section id="best-chapter">
        <BestChapter />
      </section>

      <SectionColorFan>
        <ChapterTrail />
        <section id="blogs">
          <BlogStamps />
        </section>
      </SectionColorFan>

      <WomenJourney />

      <section id="team">
        <TeamPage />
      </section>

      <section id="contributors">
        <ContributorsSection />
      </section>

      <Footer />

      <section id="envelope-footer">
        <EnvelopeFooter />
      </section>
    </main>
  );
}
