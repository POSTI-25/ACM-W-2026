# Award flight

The award scene uses a deferred Three.js renderer with a folded, double-sided paper-plane mesh. Its 26-second cycle contains two spatial figure-eights, curvature-driven banks up to 90 degrees, opposite barrel rolls, and a held inverted pass. A full perspective-camera orbit adds side-profile views, depth changes, tracking lag, and light sway. Speed increases at crossovers and decreases around the lobes.

- `awardFlightMotion.ts` owns continuous motion and maneuver timing. `npm run test:award-flight` checks loop continuity, bounded banking, complete rolls/inversion, and speed variation.
- `awardFlightScene.ts` owns mesh, lighting, camera, pooled trail buffers, text occlusion, context recovery, resizing, and GPU disposal.
- `awardFlightTrail.ts` renders a camera-facing ink ribbon at 5.5 CSS pixels on desktop and 4.25 on phones. Its dark center tapers and fades over 3.2 seconds; timestamped history keeps the fade independent of frame rate. The ribbon starts at the aircraft tail and uses one draw call with reusable buffers.
- `PaperPlaneAnimation.tsx` loads the scene near the viewport and pauses it off-screen or in a hidden document. Reduced motion and unavailable WebGL retain a static SVG illustration.
- A measured, softly feathered alpha mask attenuates the aircraft behind the text blocks so the lettering stays legible without the flight disappearing. The banner keeps its existing six-pixel float; its DOM never follows the aircraft camera.

No external 3D models, textures, network services, or new packages are required. Pixel ratio is capped at 1.75, and the scene uses no shadows or post-processing. Screenshots show individual poses; use the live preview to review the full flight and camera movement. Browser checks cover desktop and phone layouts; reduced-motion/context-loss fallbacks are implemented but were not browser-emulated during this change.
