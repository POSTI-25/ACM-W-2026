import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'

// ── Render once the (preloaded) brand fonts are in ──
// Every heading is set in Kovanov. If React renders before it has arrived,
// the page is laid out with Georgia's metrics and then every heading grows
// or shrinks a beat later — a visible shift in the sections below the fold.
// The fonts are preloaded from index.html so this normally resolves before
// the JS bundle has even finished evaluating; the cap keeps a slow or failed
// font fetch from ever holding the page hostage.
const FONT_WAIT_CAP_MS = 1500
const fontsReady = Promise.race([
  Promise.all([
    document.fonts.load('700 1rem "Kovanov"'),
    document.fonts.load('400 1rem "Kovanov"'),
    document.fonts.load('400 1rem "Quicksand"'),
  ]).catch(() => undefined),
  new Promise((resolve) => setTimeout(resolve, FONT_WAIT_CAP_MS)),
])

fontsReady.then(() => {
  createRoot(document.getElementById('root')!).render(<App />)
})
