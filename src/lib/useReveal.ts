import { useEffect, useRef } from 'react';

/** Visible without enhancement, including direct anchor arrivals. */
export function useReveal<T extends HTMLElement = HTMLDivElement>() {
  const ref = useRef<T>(null);
  useEffect(() => {
    const root = ref.current;
    if (!root || !('IntersectionObserver' in window)) return;
    const media = matchMedia('(prefers-reduced-motion: reduce)');
    const elements = Array.from(root.querySelectorAll<HTMLElement>('[data-reveal]'));
    const observer = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (!entry.isIntersecting) return;
        (entry.target as HTMLElement).dataset.revealState = 'visible';
        observer.unobserve(entry.target);
      });
    }, { threshold: 0.08 });
    const prepare = () => {
      observer.disconnect();
      elements.forEach(element => {
        if (media.matches || element.getBoundingClientRect().top < innerHeight * .98) {
          element.dataset.revealState = 'visible';
        } else {
          element.dataset.revealState = 'pending';
          observer.observe(element);
        }
      });
    };
    prepare();
    media.addEventListener('change', prepare);
    return () => {
      observer.disconnect();
      media.removeEventListener('change', prepare);
      elements.forEach(element => { delete element.dataset.revealState; });
    };
  }, []);
  return ref;
}
