import EnvelopeMenu from './EnvelopeMenu';
import EnvelopeFooter from './components/EnvelopeFooter';
import PostcardLoader from './components/PostcardLoader';
import About from './pages/About';
import BlogStamps from './pages/BlogStamps';
import ContributorsSection from './pages/Contributors';
import Events from './pages/Events';
import BestChapter from './pages/BestChapter';
import TeamPage from './pages/TeamPage';
import WomenInStem from './pages/WomenInStem';
import Footer from './components/Footer';
import TitleCard from './components/TitleCard';
import './App.css';
import './editorial.css';

export default function App() {
  return <>
    <a className="skip-link" href="#about">Skip to the chapter</a>
    <EnvelopeMenu />
    <main className="site-main">
      <section id="home" data-site-section tabIndex={-1} className="hero-section">
        <h1 className="sr-only">ACM-W VIT — a community for women in computing</h1>
        <PostcardLoader />
        <a href="#about" className="hero-scroll"><span>Every good story starts with a little curiosity</span><span aria-hidden="true">↓</span></a>
      </section>
      <section id="about" data-site-section tabIndex={-1}><About /></section>
      <section id="events" data-site-section tabIndex={-1}><Events /></section>
      <section id="best-chapter" data-site-section tabIndex={-1}><BestChapter /></section>
      <section id="blogs" data-site-section tabIndex={-1}><BlogStamps /></section>
      <section id="title-card-section" data-site-section tabIndex={-1}><TitleCard /></section>
      <section id="women-in-stem" tabIndex={-1}><WomenInStem /></section>
      <section id="team" data-site-section tabIndex={-1}><TeamPage /></section>
      <section id="contributors" data-site-section tabIndex={-1}><ContributorsSection /></section>
      <Footer />
      <section id="contact" data-site-section tabIndex={-1}><EnvelopeFooter /></section>
    </main>
  </>;
}
