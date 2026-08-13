/**
 * real-frames/*.jpg  ->  public/frames/{sm,md,lg}/NNNN.webp
 *
 * Run with:  node scripts/build-frames.mjs
 *
 * The source is 100 JPGs at 1920x1080 — a rendered sequence that opens on a
 * light burst, settles to a sealed brass orb, flies inside the machine, and
 * reassembles. All 100 are unique (checked, not assumed), so none are dropped.
 *
 * Two things happen here that matter:
 *
 * 1. PHONES GET A DIFFERENT CROP, not just a smaller image. The canvas covers
 *    the viewport. Covering a 390x844 phone with a 16:9 frame means scaling to
 *    the *height* — the old sequence shipped a 768px-wide landscape source and
 *    the browser blew it up about 2.4x to do that, which is exactly as soft as
 *    it sounds. Everything in this footage is radially composed around a dead-
 *    centre subject, so a 4:5 centre crop loses the outer hardware and keeps
 *    the whole of what the shot is actually about. Cropped first, the phone
 *    tier is then drawn at roughly 1:1 instead of upscaled, so it is both
 *    sharper and cheaper to paint.
 *
 * 2. A HALF-PIXEL BLUR ON THE SMALL TIERS. The renders carry baked-in film
 *    grain and floating dust. That is high-frequency detail which changes
 *    randomly frame to frame, so WebP has to spend real bits on it and can
 *    never predict it. Softening it costs nothing visible at the size these
 *    tiers are drawn, and the page lays its own grain over the canvas anyway.
 *    The desktop tier is left alone — there the grain is part of the texture
 *    and there are enough pixels to carry it.
 *
 * Deliberately NOT graded. The old sequence needed a warm bias to sit next to
 * the palette; this one *is* the palette — every colour token in globals.css
 * was sampled back out of these files. Grading here would mean the tokens no
 * longer describe the footage.
 */

import { mkdir, readFile, readdir, rm, writeFile } from 'node:fs/promises';
import { createHash } from 'node:crypto';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import sharp from 'sharp';

import { FRAMES_VERSION } from '../lib/frames.js';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const SRC = path.join(ROOT, 'real-frames');
/* Version comes from lib/frames.js so the directory written here and the path
   the page requests cannot drift — see the note there for why the segment
   exists at all. */
const OUT = path.join(ROOT, 'public', 'frames', FRAMES_VERSION);

const SRC_W = 1920;
const SRC_H = 1080;

/* 4:5 out of 16:9, centred. 1080 tall means 864 wide; the sides that fall away
   are background and the outermost hardware, never the subject. */
const PHONE_CROP = {
  left: Math.round((SRC_W - (SRC_H * 4) / 5) / 2),
  top: 0,
  width: Math.round((SRC_H * 4) / 5),
  height: SRC_H,
};

/* Widths are driven by what the canvas actually asks for, at the device-pixel
   ceiling FrameSequence imposes (1.25x on phones, 1.5x elsewhere) — not by
   round numbers. Past that ceiling every extra source pixel is thrown away by
   drawImage, so it is pure download and decode cost. */
/* The sequence is defocused to about 2px on screen, so the footage reads as a
   backdrop and the type in front of it stops competing with the hardware.
   Baked here rather than as `filter: blur(2px)` on the canvas, for the reason
   the note at the top of the backdrop section in globals.css gives: the canvas
   repaints on every scroll tick, and a filter would make the compositor redo
   the blur on every one of them. This costs nothing at runtime.

   The number differs per tier because each is drawn at a different scale, and
   a blur baked at source resolution scales with the image. Per tier that is
   (canvas px per source px) / (device-pixel ceiling FrameSequence imposes):
   sm covers a portrait phone by height, 1055/800 at 1.25x, so a source pixel
   lands as 1.06 CSS px; md the same way at 1.5x gives 1.11; lg covers a
   desktop by width, 2520/1920 at 1.5x, giving 0.88 — which is why lg needs the
   largest sigma to arrive at the same 2px. These subsume the old half-pixel
   grain softening entirely. */
const TIERS = [
  { tier: 'sm', crop: PHONE_CROP, width: 640, height: 800, quality: 60, blur: 1.9 },
  { tier: 'md', crop: null, width: 1280, height: 720, quality: 58, blur: 1.8 },
  { tier: 'lg', crop: null, width: 1920, height: 1080, quality: 56, blur: 2.3 },
];

const digest = (buf) => createHash('md5').update(buf).digest('hex');

async function main() {
  const files = (await readdir(SRC)).filter((f) => f.endsWith('.jpg')).sort();
  if (!files.length) throw new Error(`no .jpg files in ${SRC}`);

  // The previous sequence came out of a GIF and repeated five frames, which
  // made the scrub visibly stall at those points. Check rather than trust.
  const buffers = [];
  let last = null;
  let dropped = 0;
  for (const f of files) {
    const buf = await readFile(path.join(SRC, f));
    const hash = digest(buf);
    if (hash === last) { dropped++; continue; }
    last = hash;
    buffers.push(buf);
  }
  console.log(`${buffers.length} frames${dropped ? ` (${dropped} duplicate(s) dropped)` : ' (no duplicates)'}`);

  // 100 replaces 150, so stale 0101-0150 would otherwise be left behind and
  // served forever.
  await rm(OUT, { recursive: true, force: true });

  const report = [];
  for (const { tier, crop, width, height, quality, blur } of TIERS) {
    const dir = path.join(OUT, tier);
    await mkdir(dir, { recursive: true });

    let bytes = 0;
    for (let i = 0; i < buffers.length; i++) {
      let pipe = sharp(buffers[i]);
      if (crop) pipe = pipe.extract(crop);
      pipe = pipe.resize(width, height, { fit: 'fill' });
      if (blur) pipe = pipe.blur(blur);
      const out = await pipe.webp({ quality, effort: 6, smartSubsample: true }).toBuffer();
      await writeFile(path.join(dir, `${String(i + 1).padStart(4, '0')}.webp`), out);
      bytes += out.length;
    }

    report.push(
      `${tier}: ${buffers.length} x ${width}x${height} — ${(bytes / 1024 / 1024).toFixed(2)} MB ` +
        `(${Math.round(bytes / buffers.length / 1024)} KB/frame)`
    );
  }

  report.forEach((line) => console.log(line));
  console.log(`\nSet TOTAL_FRAMES to ${buffers.length} in lib/frames.js`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
