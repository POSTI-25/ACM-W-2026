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
import Gallery from "./components/Footer";
import SectionColorFan from "./components/SectionColorFan";
import ChapterJourney from "./components/ChapterJourney";
import EventsTitle from "./components/EventsTitle";
import EditorialChapter from "./components/EditorialChapter";
import quill from "./assets/editorial/quill-inkwell.png";
import camera from "./assets/editorial/archival/camera-engraving.webp";
import { startSmoothScroll } from "./lib/smoothScroll";

import "./App.css";
import "./components/PaperSurfaces.css";

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
      <SectionColorFan name="events" heading={<EventsTitle />} surface="#c9a09a" bands={['#b77d80', '#e4c5bc']}
        eyebrow="01 / GATHERINGS" subtitle="Small sparks. Shared possibilities.">
        <ChapterJourney>
          <section id="events">
            <Events />
          </section>
        </ChapterJourney>
      </SectionColorFan>

      <section id="best-chapter" style={{ backgroundColor: '#c9a09a' }}>
        <BestChapter />
      </section>

      <EditorialChapter name="blogs" number="02" title="BLOGS" line="THE READING ROOM"
        from="#c9a09a" surface="#bd8588"
        description="Ideas worth a closer look. Stories worth passing on." artwork={quill}>
        <BlogStamps />
      </EditorialChapter>

      <WomenJourney />

      <SectionColorFan name="team" heading="THE TEAM" surface="#b58d91" bands={['#bd8588', '#e4c5bc']}
        eyebrow="04 / OUR PEOPLE" subtitle="Different minds. A shared sense of possibility.">
        <section id="team">
          <TeamPage />
        </section>
      </SectionColorFan>

      <EditorialChapter name="contributors" number="05" title="CONTRIBUTORS" line="BEHIND THESE PAGES" layout="type"
        from="#b58d91" surface="#cda6b1"
        description="A website, made together. Meet the people who brought this chapter to life.">
        <ContributorsSection />
      </EditorialChapter>

      <EditorialChapter name="gallery" number="06" title="GALLERY" line="THE CHAPTER ARCHIVE" layout="image"
        from="#cda6b1" surface="#e4c5bc"
        description="The people, the moments, the stories between." artwork={camera}>
        <Gallery />
      </EditorialChapter>

      <SectionColorFan name="contact" heading="CONTACT US" from="#e4c5bc" bands={['#bd8588', '#cda6b1']}>
        <section id="envelope-footer">
          <EnvelopeFooter />
        </section>
      </SectionColorFan>
    </main>
  );
}
