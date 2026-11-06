import { useEffect, useState } from "react";
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import EnvelopeMenu from "./EnvelopeMenu";
import EnvelopeFooter from './components/EnvelopeFooter';
import MobileEnvelopeNavbar from "./components/MobileEnvelopeNavbar";
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
import EventsTitle, { RollingSectionTitle } from "./components/EventsTitle";
import { startSmoothScroll } from "./lib/smoothScroll";

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

/* Native sticky transition stages reserve their own space in normal flow.
 * Keep overflow-x: clip: hidden would break sticky globe/envelope scenes. */
export default function App() {
  const [entered, setEntered] = useState(false);
  useEffect(() => {
    const stop = startSmoothScroll();
    const frame = requestAnimationFrame(() => ScrollTrigger.refresh());
    return () => { cancelAnimationFrame(frame); stop(); };
  }, []);

  return (
    <main className="site-main relative bg-[#fff9e9]">
      <div id="home" />
      <About onIntroChange={setEntered} />
      {entered && <>
      <GlobalNavbar />
      <MobileEnvelopeNavbar />
      </>}
      <SectionColorFan name="events" heading={<EventsTitle />} surface="#f2e8cf">
        <ChapterJourney>
          <section id="events">
            <Events />
          </section>
        </ChapterJourney>
      </SectionColorFan>

      <section id="best-chapter" className="bg-[#f2e8cf]">
        <BestChapter />
      </section>

      <SectionColorFan name="blogs" heading={<RollingSectionTitle word="BLOGS" sectionId="blogs" staticLetters={2} as="h2" />} from="#f2e8cf" artwork={false}>
        <ChapterTrail />
        <section id="blogs">
          <BlogStamps />
        </section>
      </SectionColorFan>

      <WomenJourney />

      <SectionColorFan name="team" heading="THE TEAM" surface="#b49880" bands={['#d9bfb8', '#f2e8cf']}>
        <section id="team">
          <TeamPage />
        </section>
      </SectionColorFan>

      <SectionColorFan name="contributors" heading="CONTRIBUTORS" from="#b49880" surface="#b49880" bands={['#d9bfb8', '#f2e8cf']}>
        <section id="contributors">
          <ContributorsSection />
        </section>
      </SectionColorFan>

      <SectionColorFan name="gallery" heading="GALLERY" from="#b49880" surface="#b49880" bands={['#d9bfb8', '#f2e8cf']}>
        <Footer />
      </SectionColorFan>

      <SectionColorFan name="contact" heading="CONTACT US" from="#b49880">
        <section id="envelope-footer">
          <EnvelopeFooter />
        </section>
      </SectionColorFan>
    </main>
  );
}
