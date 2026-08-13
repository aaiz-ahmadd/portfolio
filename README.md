# Aaiz Ahmad — Portfolio

A single-page portfolio built around a scroll-scrubbed image sequence. The page
sits on one continuous camera move: a light burst that settles into a sealed
brass orb, opens, flies through the machine inside it, reassembles, and lights
again. Scrolling is the only thing that moves it — forward on the way down,
backward on the way up.

The layout answers the footage rather than sitting on top of it. Two rules run
the whole design, and both come from measuring the frames:

1. **The centre is not ours.** Every frame is composed radially around a
   dead-centre subject, so the grid reserves a channel down the middle and puts
   all copy in the outer thirds.
2. **The sides get hot in the middle.** Copy floats free on the footage at the
   two open ends and sits on opaque plates through the bright interior stretch.
   The page is quiet, then dense, then quiet — which is what the footage does.

**Stack:** Next.js 15 (App Router) · React 19 · GSAP 3 + ScrollTrigger · plain CSS

---

## Running it

```bash
npm install
npm run dev        # http://localhost:3000
npm run build && npm start
```

---

## Layout

```
app/
  layout.jsx           fonts, metadata, the per-tier frame preloads
  page.jsx             section order, the veil ramp, reveal batching
  globals.css          design tokens + all styling
components/
  FrameSequence.jsx    the scroll-scrubbed canvas
  Portrait.jsx         the 25-frame smile, scrubbed by its own travel
  IndexRail.jsx  Dimmer.jsx  Figure.jsx
  Hero.jsx  Approach.jsx  Education.jsx  Stack.jsx  Work.jsx  Contact.jsx
lib/
  content.js           every word on the page
  frames.js            frame count, version, resolution tiers
  portrait.js  theme.js  scroll.js
scripts/
  build-frames.mjs     real-frames/ -> public/frames/<version>/
  build-portrait.mjs   smiling-frames/ -> public/portrait/
real-frames/           the 100 source JPEGs for the backdrop
smiling-frames/        the 30 source JPEGs for the portrait
```

Sections map onto the run like this:

| # | Section | Frames | What the footage is doing |
|---|---------|--------|---------------------------|
| 00 | Hero | 1–20 | the burst, settling |
| 01 | Approach | 20–32 | the sealed orb — darkest, quietest |
| 02 | Education | 32–48 | it opens |
| 03 | Stack | 48–66 | the components, laid out |
| 04 | Work | 66–88 | deepest interior, then reassembly |
| 05 | Contact | 88–100 | re-ignition |

---

## Editing your content

**Everything on the page comes from one file: [`lib/content.js`](lib/content.js).**
Name, contact links, about copy, education, skills, projects, certifications.
Change it there and every section updates — you never need to touch a component.

To add a project, add an object to the `projects` array. To reorder them, move
the objects — the `01 / 02 / 03` numbering is generated from position, and the
left/right alternation follows it.

---

## The frame sequence

`real-frames/` holds the 100 source JPEGs (1920×1080). Those are **not** shipped.
`public/frames/<version>/` holds the optimised set that actually loads:

| Tier | Size | Total | Serves | Media query |
|------|------|-------|--------|-------------|
| `sm` | 640×800 (4:5) | 2.10 MB | portrait phones | `(max-width: 540px) and (orientation: portrait)` |
| `md` | 1280×720 | 2.75 MB | phones in landscape, tablets, small laptops | landscape ≤540px, or 541–1200px |
| `lg` | 1920×1080 | 4.27 MB | desktops, including retina laptops | `(min-width: 1201px)` |

Only one tier is ever fetched.

**The phone tier is a different crop, not a smaller picture.** The canvas covers
the viewport, so covering a 390×844 phone with a 16:9 frame means scaling to the
*height* — the previous sequence shipped a 768px-wide landscape source and the
browser blew it up about 2.4× to do it. Everything in this footage is composed
radially around a dead-centre subject, so a 4:5 centre crop loses the outer
hardware and keeps the whole of what the shot is about. Cropped first, the phone
tier is drawn at roughly 1:1 instead — sharper *and* cheaper to paint. That is
also why the tier queries are orientation-sensitive, and why `FrameSequence`
re-picks the tier when the width changes.

### Rebuilding them

```bash
node scripts/build-frames.mjs     # needs sharp, which ships with Next
```

If the frame count changes, update `TOTAL_FRAMES` in `lib/frames.js` — the script
prints the number.

### ⚠️ If you replace the footage, bump `FRAMES_VERSION`

`next.config.mjs` serves `/frames/*` with `immutable, max-age=31536000`, which is
the right header and a trap without a version in the path. The files are numbered
`0001.webp`, not content-hashed, so a new sequence reuses every URL — and
`immutable` means a returning browser will not even revalidate. Swapping the
footage without moving it leaves anyone who saw the old site pinned to it for a
year. Bump `FRAMES_VERSION` in [`lib/frames.js`](lib/frames.js) and rebuild; the
script reads it, so the directory written and the path requested cannot drift.

### Why it stays smooth

- **Frames are held as `<img>`, not `ImageBitmap`.** 100 decoded 1920×1080
  bitmaps would pin ~800 MB and kill mobile Safari. As `<img>` the browser keeps
  only the compressed bytes resident and manages the decoded cache itself.
  `img.decode()` warms it off the main thread so the first `drawImage` never
  stalls a scroll tick.
- **Nothing blurs anything.** No `backdrop-filter` anywhere on the page. The
  canvas repaints on every scroll tick, and a frosted panel over it makes the
  compositor re-blur on every one of them — the single largest source of jank
  available to a page like this. The plates are opaque instead, which is also
  closer to the machined metal in the footage than frosted glass.
- **The device pixel ratio is capped at 1.5** (1.25 on phones). Measured on a
  1680×819 viewport at DPR 2, drawing an `lg` frame to cover costs **0.15 ms** at
  a 1.5 cap versus **0.27 ms** at 2 — the buffer-area ratio exactly, because the
  cost is fill rate. The reason to take 1.5 is not the millisecond, which is
  under 1% of a 60 fps budget either way; it is that a 2× buffer is 3360px wide
  against a 1920px source, so the extra pixels are interpolated ones.
- **Nothing animates except `transform` and `opacity`**, and the canvas repaints
  only when the integer frame index changes.
- **`ScrollTrigger.config({ ignoreMobileResize: true })`.** A phone's address bar
  collapsing fires a resize, and the default response is a full refresh mid-scroll
  — remeasure everything, then restore the scroll position, while a finger is
  still on the glass. The heights that matter are written in `svh`, which doesn't
  move when the bar does, so there is nothing to remeasure.
- **`scroll-behavior: smooth` is deliberately not set globally** — see
  [`lib/scroll.js`](lib/scroll.js). ScrollTrigger *writes* the scroll position on
  every refresh, and with smoothing on globally those internal restores become
  animations that fight anything landing on top of them.

---

## Design notes

The palette is sampled out of the frames, not invented. Measured field greens
`#0c2617 / #153926 / #1c4a31`, brass `#c9a24e`, blown core `#faeed0`, component
metal `#919189`.

Type: **Archivo** for display, **Schibsted Grotesk** for body, **JetBrains Mono**
for labels, indices and part numbers. The render is already doing the beautiful
work, so the display face does the opposite job — set enormous and tight, it
reads as structure against the light rather than competing with it.

### Contrast is measured against the actual frames

Checking text against a single sampled mid-tone is not enough here, because the
background moves. Sampling the 90th-percentile luminance of the left and right
thirds — the only places copy is ever put — across the run gives roughly 83–91
under the hero, ~58 at the sealed orb, and 104–150 with 248 peaks through the
whole interior stretch.

| Token | Used for | On plate | Floating |
|-------|----------|----------|----------|
| `--paper` | body and headings | 12.2:1 | 9.8:1 |
| `--paper-2` | secondary copy | 8.1:1 | 6.5:1 |
| `--paper-3` | mono labels, metadata | 5.4:1 | 5.1:1 |
| `--brass-lit` | small text on the footage | 9.6:1 | 6.3:1 |

Three things carry legibility, and they matter more than the colour values:

- **The plates.** Through the interior stretch the sides are too bright for
  floating copy at any colour, so the copy goes on opaque panels instead. This is
  why the design has a dense middle and open ends.
- **The `.veil`.** Scrubbed against scroll to track the footage's own brightness
  curve; its stops are set from the measured luminance above, not by eye. Note it
  comes *down* through the middle rather than up — the plates already hold the
  copy there, so the veil only has to protect the section titles floating outside
  them, and over-veiling would flatten the best footage in the run into mud.
- **The glyph halo.** No flat text colour beats a bare heatsink edge peaking near
  248 behind a line of 12px mono. A tight dark `text-shadow` keeps glyph edges
  separated without dimming the frames further.

---

## Accessibility

- `prefers-reduced-motion` is honoured: no scrubbing, no reveals, and a single
  still frame is downloaded instead of the full sequence.
- All content renders in the HTML — the animation is decoration, not a
  dependency. Reveals have a catch-up pass so nothing can stay invisible after a
  deep link or a fast scroll, and a `<noscript>` block puts everything in its
  resting state.
- The index rail marks the active section with colour and tick length rather than
  by revealing a label, so it never overlaps the column beside it.
- Visible keyboard focus, semantic landmarks, and a drag-slop guard on the index
  so a thumb flick along the bottom bar can't be read as a tap.

---

## Deploying

The whole page prerenders to static output (156 kB First Load JS).

```bash
npx vercel        # or: push to GitHub and import at vercel.com
```
