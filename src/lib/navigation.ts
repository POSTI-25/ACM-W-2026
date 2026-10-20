import type { MouseEvent } from 'react';

export function navigateToSection(hash: string, behavior?: ScrollBehavior) {
  let id: string;
  try { id = decodeURIComponent(hash.replace(/^#/, '')); } catch { return; }
  const target = document.getElementById(id);
  if (!target) return;
  target.focus({ preventScroll: true });
  target.scrollIntoView({ behavior: behavior ?? (matchMedia('(prefers-reduced-motion: reduce)').matches ? 'instant' : 'smooth'), block: 'start' });
}

export function followSectionLink(event: MouseEvent<HTMLAnchorElement>) {
  if (event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
  const hash = event.currentTarget.hash;
  if (!hash || !document.getElementById(hash.slice(1))) return;
  event.preventDefault();
  if (location.hash !== hash) history.pushState(null, '', hash);
  navigateToSection(hash);
}
