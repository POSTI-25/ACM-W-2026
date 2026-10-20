import { useEffect, useRef, useState } from 'react';
import closedEnv from './assets/closed.svg';
import openEnv from './assets/open.svg';
import { followSectionLink, navigateToSection } from './lib/navigation';

const destinations = [
  ['01', 'The chapter', 'about'], ['02', 'Our events', 'events'],
  ['03', 'Recognition', 'best-chapter'], ['04', 'The reading room', 'blogs'],
  ['05', 'Women in STEM', 'title-card-section'], ['06', 'Our people', 'team'],
  ['07', 'Contributors', 'contributors'], ['08', 'Say hello', 'contact'],
];

export default function EnvelopeMenu() {
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState('home');
  const root = useRef<HTMLElement>(null);
  const toggle = useRef<HTMLButtonElement>(null);
  useEffect(() => {
    const close = (event: PointerEvent) => {
      if (root.current && !root.current.contains(event.target as Node)) setOpen(false);
    };
    const escape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') { setOpen(false); toggle.current?.focus(); }
    };
    document.addEventListener('pointerdown', close);
    document.addEventListener('keydown', escape);
    return () => {
      document.removeEventListener('pointerdown', close);
      document.removeEventListener('keydown', escape);
    };
  }, []);
  useEffect(() => {
    const observer = new IntersectionObserver(entries => {
      entries.forEach(entry => { if (entry.isIntersecting) setActive(entry.target.id); });
    }, { rootMargin: '-10% 0px -65% 0px', threshold: 0 });
    document.querySelectorAll('[data-site-section]').forEach(section => observer.observe(section));
    const restore = () => { if (location.hash) navigateToSection(location.hash, 'instant'); };
    const frame = requestAnimationFrame(restore);
    window.addEventListener('popstate', restore);
    window.addEventListener('hashchange', restore);
    return () => {
      observer.disconnect(); cancelAnimationFrame(frame);
      window.removeEventListener('popstate', restore);
      window.removeEventListener('hashchange', restore);
    };
  }, []);
  return (
    <header ref={root} className={`site-header ${active !== 'home' ? 'site-header--reading' : ''}`}>
      <a href="#home" className="chapter-brand" onClick={event => { setOpen(false); followSectionLink(event); }} aria-label="ACM-W VIT, home">
        <span>acm-w<span className="brand-star" aria-hidden="true">✳</span></span>
        <small>VIT · VELLORE</small>
      </a>
      <button ref={toggle} type="button" className="envelope-toggle" aria-expanded={open} aria-controls="chapter-navigation" onClick={() => setOpen(value => !value)}>
        <span>{open ? 'Close' : 'Explore'}</span><img src={open ? openEnv : closedEnv} alt="" />
      </button>
      <nav id="chapter-navigation" aria-label="Chapter navigation" className={`chapter-menu ${open ? 'chapter-menu--open' : ''}`} inert={!open} aria-hidden={!open}>
        <p className="eyebrow">A LITTLE LETTER FROM ACM-W</p>
        {destinations.map(([number, label, id]) => (
          <a key={id} href={`#${id}`} aria-current={active === id ? 'location' : undefined} onClick={event => { setOpen(false); followSectionLink(event); }}>
            <small>{number}</small><span>{label}</span><span aria-hidden="true">↗</span>
          </a>
        ))}
        <p className="menu-signoff">Curiosity. Community. A little courage.</p>
      </nav>
    </header>
  );
}
