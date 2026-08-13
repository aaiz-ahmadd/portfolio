/**
 * smiling-frames/*.jpg  ->  public/portrait/{sm,lg}/NNNN.webp
 *
 * Run with:  node scripts/build-portrait.mjs
 *
 * The source is a 1080x1920 phone clip exported to 30 JPGs. Three things
 * happen here, all of them so the browser has nothing left to do at runtime:
 *
 * 1. CROP to 4:5 around the subject, tightly. The card is 230px wide now and
 *    sits beside the Approach copy rather than filling a column of the hero,
 *    and at that size the old wider framing read as a thumbnail of a room with
 *    someone in it. See CROP below.
 *
 * 2. DEDUPE. The export came from a GIF, so five frames are byte-identical to
 *    their predecessor (3, 13, 18, 23, 28). Left in, the scrub visibly stalls
 *    at those five points. Dropped, the remaining 25 space evenly.
 *
 * 3. GRADE, hard. The room is lit through blue-grey curtains, and the backdrop
 *    of the new sequence is a properly saturated emerald with brass in it —
 *    next to that, a cyan window reads as a piece of a different website. The
 *    grade is what seats the photo in the palette; see WARM below for how it
 *    keeps skin tone while losing the cast. Baked in rather than done as a CSS
 *    filter: the canvas repaints on every scroll tick, and a filter would
 *    repeat this work on every one of them.
 */

import { mkdir, readFile, rm, writeFile } from 'node:fs/promises';
import { createHash } from 'node:crypto';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import sharp from 'sharp';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const SRC = path.join(ROOT, 'smiling-frames');
const OUT = path.join(ROOT, 'public', 'portrait');

const SOURCE_COUNT = 30;
/* 4:5 out of 1080x1920, and tighter than it used to be. The old crop was cut
   for a 400px card in the hero; the card is 230px now and lives beside the
   Approach copy, and at that size the wider framing read as a thumbnail of a
   room with someone in it. This pushes in about 1.25x further and recentres on
   him, which puts his eyes back on the upper third line at the size the card
   is actually drawn. */
const CROP = { left: 78, top: 600, width: 720, height: 900 };

/* Widths are driven by the card's CSS size x device pixel ratio. The card is
   much smaller than it used to be — it moved out of the hero and into the
   Approach section, where it is 230px at most — so these came down with it:
   lg covers 230px at 2x, sm covers a 46vw card on a 3x phone.
   The blur is the reason this ships at a fraction of the size it otherwise
   would. The source is phone video, so every frame carries sensor noise —
   high-frequency detail that changes randomly frame to frame and that WebP
   has to spend real bits encoding. Half a pixel of blur removes it, costs
   nothing visible at the size the card is actually drawn, and reads as film
   softness against the grain the page already lays over everything. */
const TIERS = [
  { tier: 'sm', width: 540, quality: 56, blur: 0.6 },
  { tier: 'lg', width: 560, quality: 56, blur: 0.6 },
];

/* The room is lit through blue-grey curtains, and the curtain fills a third of
   the frame. Against the old sequence — near-neutral pine, low saturation —
   a gentle nudge was enough to seat it. This sequence is a properly saturated
   emerald with brass in it, and next to that the same photo read as a piece of
   a different website: a cyan rectangle in a warm green room.
   So the grade is much stronger now. Saturation comes most of the way down,
   which is what kills the cyan, and the matrix then pushes what is left toward
   the warm end so the curtain lands as a warm grey rather than a blue one.
   Blue gives up 20% and red takes it. Skin sits in the red-orange range where
   the matrix is close to identity, so it keeps its colour while the room
   loses its cast — which is the whole trick. */
const WARM = [
  [1.18, 0.1, 0.0],
  [0.03, 1.02, 0.0],
  [0.0, 0.04, 0.7],
];

const digest = (buf) => createHash('md5').update(buf).digest('hex');

async function main() {
  // Read every source frame and keep only the ones that actually differ from
  // the frame before them.
  const unique = [];
  let last = null;
  for (let i = 1; i <= SOURCE_COUNT; i++) {
    const file = path.join(SRC, `ezgif-frame-${String(i).padStart(3, '0')}.jpg`);
    const buf = await readFile(file);
    const hash = digest(buf);
    if (hash === last) continue;
    last = hash;
    unique.push(buf);
  }
  console.log(`${unique.length} unique frames of ${SOURCE_COUNT}`);

  await rm(OUT, { recursive: true, force: true });

  const report = [];
  for (const { tier, width, quality, blur } of TIERS) {
    const dir = path.join(OUT, tier);
    await mkdir(dir, { recursive: true });

    let bytes = 0;
    for (let i = 0; i < unique.length; i++) {
      const out = await sharp(unique[i])
        .extract(CROP)
        .resize(width, Math.round((width * 5) / 4), { fit: 'fill' })
        .modulate({ saturation: 0.32 })
        .recomb(WARM)
        /* Slightly under 1 and biased down, so the card sits into the page
           rather than floating off it — it is a small object on a dark field
           now, not the brightest thing in a hero. */
        .linear(0.98, -10)
        .blur(blur)
        .webp({ quality, effort: 6, smartSubsample: true })
        .toBuffer();
      await writeFile(path.join(dir, `${String(i + 1).padStart(4, '0')}.webp`), out);
      bytes += out.length;
    }
    report.push(`${tier}: ${unique.length} frames, ${(bytes / 1024).toFixed(0)} KB total`);
  }

  report.forEach((line) => console.log(line));
  console.log(`\nSet PORTRAIT_FRAMES to ${unique.length} in lib/portrait.js`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
