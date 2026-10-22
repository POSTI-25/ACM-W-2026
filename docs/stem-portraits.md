# Women in STEM portrait motion

The five existing portrait assets now use an independent GSAP ScrollTrigger timeline. The globe renderer, camera choreography, country silhouettes, biography timing, and section dimensions are unchanged.

Portraits rise over 19% of each section's scroll range, with 1.05-second scrub smoothing in both directions. A 91%-to-100% scale and three-degree tilt settle gently, followed by a small upward drift while the biography is readable. The existing exit window is retained; the final portrait scrolls away with its section. There is no autonomous bounce or looping bob.

Phone travel is smaller, and the resting height accounts for the rotated image's bounds and biography position, keeping paper clear of longer text on short screens. Reduced motion removes translation, scale changes, and tilt interpolation, keeping a short visibility transition. MatchMedia reverts transforms and triggers on breakpoint changes/unmount; will-change is active only within a scene's scroll range.

Validation: ESLint and the production build pass (existing bundle warning remains). Browser review covered all five desktop portraits, forward/backward scrolling, and 390×844 and 375×667 phone layouts, with no console errors. Reduced-motion behavior is implemented but was not browser-emulated. Screenshots show settled poses; review the live page for the entrance.
