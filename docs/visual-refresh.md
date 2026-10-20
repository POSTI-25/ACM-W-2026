# Postcard editorial refresh

Implemented on `jahnavi/changes`, starting from `main`. All work stays in this clone. No deployment or push was performed.

The refresh keeps the chapter's cream/burgundy palette, envelope introduction, stamps, portraits, event content, section order, and postcard imagery. It applies the agreed editorial direction through calmer motion, larger typography, clearer spacing, and natural browsing.

| Previous friction | Implementation |
| --- | --- |
| Competing section entrances and scroll-coupled layouts | Shared one-time opacity/translation reveals, normal document flow, and reduced-motion alternatives |
| Dense introductory copy | Larger About photographs, separate captions and readable copy |
| Oversized event motion | Alternating stamp-and-copy rows with restrained hover feedback |
| Repeated STEM zoom sequences | One chapter title and lazy globe, followed by alternating portraits and country silhouettes |
| Blog fan obscured reading and navigation | Three visible stamps on desktop, one readable card on smaller screens, explicit controls and direct story links |
| Contributor/gallery interactions interfered with browsing | Native horizontal strips, explicit controls, keyboard-accessible flips and Escape focus return |
| Moving form made fields hard to use | Stationary letter form, optional phone, inline validation, first-error focus and separate delivery feedback |
| Large source images and external globe data dependency | 50 local WebP derivatives and generated local country borders; original images retained |

## Run locally

```powershell
npm ci
npm run dev -- --host 127.0.0.1 --port 5180
```

Production preview used for verification:

```powershell
npm run build --ignore-scripts
npm run preview -- --host 127.0.0.1 --port 4180
```

`--ignore-scripts` intentionally skips the existing `prebuild` network refresh of the blog cache. The TypeScript compilation and Vite production build still run. Use `npm run blogs` when an intentional refresh of cached articles is wanted.

`npm run media` regenerates derivatives and local globe borders from the retained source assets.

## Verification

- ESLint passed.
- Seven contact validation/delivery-contract tests passed using mocked requests.
- TypeScript and Vite production build passed.
- Browser inspection covered desktop (1440px), tablet (768px), phone (390px), and narrow-phone (320px) widths; no document-level horizontal overflow was observed in the inspected views.
- Checked section navigation and focus, blog controls, contributor flip/Escape focus return, gallery navigation, and empty-form validation.
- No console errors were captured during the final browser pass.
- Optimized image derivatives total approximately 3.4 MB compared with 53.4 MB of source images. This is an asset-size comparison, not a measured page-transfer or Lighthouse score.

## Remaining verification before deployment

- Live email delivery requires the existing Cloudflare worker and email bindings. It was not invoked from the static local preview, and no real email was sent.
- Vite reports a size warning for the lazy Three.js globe chunk (approximately 231 kB gzip). The scene loads near its section and pauses offscreen/when the tab is hidden; reduced-motion and failure paths show a static globe.
- No measured production CLS, frame-time trace, Lighthouse score, cross-browser certification, or full assistive-technology audit is claimed by this change.

## Preview captures

- [Desktop STEM](preview/desktop-stem.png)
- [Desktop reading room](preview/desktop-blogs.png)
- [Desktop About](preview/desktop-about.png)
- [Mobile contact validation](preview/mobile-contact.png)
