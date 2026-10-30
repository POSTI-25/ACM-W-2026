# Footer paper textures

## Brass sealing tool

`antique-brass-seal-stamp.webp`: 269 × 800 transparent walnut-and-brass stamping tool, generated with the built-in image_gen tool. The selected cutout was trimmed to its visible alpha bounds and resized for the scene. It travels on a separate leaf above the wax pool. The original envelope assets are unchanged.

Prompt: Use case: product-mockup. Asset type: transparent cutout of an antique handheld wax seal stamp for a vintage correspondence website animation. One realistic elegant upright sealing stamp: dark polished walnut turned bulb handle with a slender waist, aged warm brass collar, short brass stem and a broad circular brass stamping foot. Entire object shown from a nearly straight front side view, a very slight three-quarter angle only enough to show the round brass foot and wood volume. Handle straight vertical, base horizontal, flat contact face at the very bottom of the image; object must look ready to press straight down onto paper. Tall compact proportions, circular brass base roughly half the handle's total height in width. Rich tactile wood grain, muted honey brass patina, restrained soft highlights, elegant archival stationery aesthetic matching a burgundy envelope and antique gold wax. Centered isolated whole object with clear edges and small transparent margin. No hand, no paper, no wax, no envelope, no table, no writing, no letters, no logo, no watermark. Genuinely transparent background, no large external cast shadow. Soft studio light from top left.

Cleanup prompt: Edit this seal stamp cutout. Keep the exact same upright walnut handle and brass seal stamping tool, same proportions, shape, patina, highlights, and camera. Remove ALL of the surrounding brown glow, diffuse shadow, background haze and soft halo. Make every pixel outside the physical wood-and-brass object completely transparent, with a clean tight alpha edge. The flat bottom edge of the brass foot must be the lowest opaque part of the cutout. No external shadow, no background, no glow. Do not change the object design or introduce anything else. Genuinely transparent background.

The sealing choreography is in `src/components/footerSealingMotion.ts`. Scrolling controls the card and flap until closure; then a separate automatic timeline plays the wax, stamp, tilt, botanical landing and endnote without further scroll input. Sealing takes 8.2 seconds, including four larger wax blobs and a .65-second impression hold. The complete automatic finish takes about 17 seconds. The sticky section is 500vh (300vh with reduced motion), and rewinding to the open flap resets playback. Drops follow one vertical stream from just beyond the viewport's top edge; their origin is measured relative to the sticky panel so page position and responsive scaling do not move it into the middle of the screen.

## Wax seal

`antique-gold-wax-seal.webp`: transparent gold W wax seal, generated with the built-in image_gen tool. Transparent padding was trimmed and the image resized to a maximum of 384 pixels before WebP encoding. It sits in the outside flap's local wax container and is revealed under the stamping foot at the press, without changing existing envelope asset transforms.

Prompt: Use case: product-mockup. Asset type: transparent wax seal cutout for the center of a vintage burgundy envelope on a website. A single elegant round hand-poured sealing wax medallion in muted antique ochre gold, warm honey and aged brass tones, matte wax with soft restrained highlights, irregular softly scalloped wax rim, concentric impressed ring, deeply embossed serif capital W in the center, small delicate botanical laurel sprigs framing the W. Viewed exactly straight from above, front-facing flat circle, no tilt, no perspective, no backing, no envelope, no ribbon, no objects. Realistic fine wax texture, refined antique correspondence aesthetic. Neat compact silhouette centered with a little transparent margin. Soft lighting from top left, no large external cast shadow. Only the letter W, no other lettering or words. Genuinely transparent background.

Generated with the built-in image_gen tool, then resized and converted to WebP for the site.
The original envelope PNGs remain unchanged. CSS uses their alpha masks to constrain the material overlays.

- `vintage-ivory-paper.webp`: 1600 × 900, 152,738 bytes. Background, contact stationery and envelope lining.
- `vintage-burgundy-paper.webp`: 1200 × 1200, 390,936 bytes. Envelope paper surfaces.

## Ivory prompt

Use case: product-mockup. Asset type: flat paper texture for a vintage correspondence website background. Create a landscape edge-to-edge macro scan of warm antique ivory cotton writing paper, fine visible organic fibres, very subtle uneven cream and pale oat tones, a few delicate age specks, faint barely visible fold memory. Gentle diffuse light, restrained elegant archival stationery. Nearly uniform low contrast central writing area; slightly warmer at edges. Flat 2D material swatch only, no sheet edges, no objects, no border, no text, no stamps, no illustrations, no dramatic stains, no burnt edges. Wide landscape.

## Burgundy prompt

Use case: product-mockup. Asset type: flat material texture applied to an existing envelope silhouette. Create an edge-to-edge square macro scan of deep oxblood burgundy dyed cotton paper. Fine natural paper fibres and a soft dry matte tooth, restrained mottled dark claret and faded wine pigment, tiny sparse lighter worn fibres, elegant old correspondence stationery. The material remains dark rich burgundy, subtle tonal variation readable at 600px display. Flat 2D material swatch only, uniformly illuminated, no envelope shape, no folds, no objects, no borders, no text, no stamps, no logos, no scratches or distressed grunge.
