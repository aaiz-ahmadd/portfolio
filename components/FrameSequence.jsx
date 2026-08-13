'use client';

import { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

import { TOTAL_FRAMES, framePath, pickTier } from '@/lib/frames';

/**
 * Scroll-scrubbed image sequence painted to a single fixed canvas.
 *
 * The sequence is driven by scroll position and by nothing else: there is no
 * timeline, no autoplay and no rAF loop advancing it. Scrolling down moves it
 * forward, scrolling up moves it back, and stopping stops it — the frame is a
 * pure function of how far down the document you are, which is what makes it
 * reversible for free rather than by rewinding anything.
 *
 * Memory note: these stay plain <img> elements rather than ImageBitmaps.
 * A hundred decoded 1920x1080 bitmaps would pin ~800MB of RAM and kill mobile
 * Safari. As <img>, the browser holds the compressed bytes and owns the
 * decoded-frame cache, so it can evict under pressure.
 */
export default function FrameSequence({ onProgress }) {
  const canvasRef = useRef(null);
  const progressRef = useRef(onProgress);
  progressRef.current = onProgress;

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d', { alpha: false, desynchronized: true });
    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    const frames = new Array(TOTAL_FRAMES);
    const ready = new Uint8Array(TOTAL_FRAMES);
    let readyCount = 0;
    let disposed = false;

    /* The last frame position asked for, as a fraction, and the pair actually
       on the canvas. `want` is kept so a resize can repaint where the scroll
       currently is rather than jumping to zero. */
    let want = 0;
    let lastA = -1;
    let lastB = -1;
    let lastT = -1;

    /* Reduced motion gets a single still frame, not the sequence. Frame 1 is
       the light burst at the top of the run: it reads as an intentional
       backdrop and keeps text contrast high, since the veil never ramps. */
    const LAST = reduceMotion ? 1 : TOTAL_FRAMES;

    /* The tier must match the one preloaded in the document head — both come
       from the same media queries in lib/frames.js. It is re-read on resize
       because the phone tier is a 4:5 crop rather than a smaller copy of the
       same picture, so turning a phone sideways genuinely changes which file
       is the right one. `generation` is what makes that safe: it invalidates
       every load still in flight for the tier we just left, so a slow response
       from the old tier cannot paint over the new one. */
    let tier = pickTier();
    let generation = 0;

    // ---- canvas sizing -----------------------------------------------------
    const resize = () => {
      const w = window.innerWidth;
      const h = window.innerHeight;
      /* Every scroll tick redraws the whole canvas, so its pixel count is the
         per-tick cost. Measured on a 1680x819 viewport at devicePixelRatio 2,
         drawing an lg frame to cover: 0.15ms per frame at a 1.5 cap, 0.27ms at
         2. That is the buffer area ratio and nothing else — the cost is fill
         rate, so it tracks pixels exactly.
         The reason to take 1.5 is therefore not the millisecond, which is
         under 1% of a 60fps budget either way on this hardware; it is that a
         2x buffer here is 3360px wide and the source is 1920, so every one of
         those extra pixels is interpolated. It is fill rate spent on detail
         the file does not contain, and on weaker GPUs than this one that is no
         longer free. Phones take 1.25, where the 4:5 crop already lands close
         to 1:1 and has even less headroom to spend. */
      const dpr = Math.min(window.devicePixelRatio || 1, w <= 540 ? 1.25 : 1.5);
      canvas.width = Math.round(w * dpr);
      canvas.height = Math.round(h * dpr);
      canvas.style.width = w + 'px';
      canvas.style.height = h + 'px';
      /* Sizing the canvas resets the 2D context, so this is re-set here rather
         than once at setup.
         'medium' is a defensive choice, not a measured win: on a GPU-composited
         canvas the two settings benchmarked identically here (0.15 vs 0.16ms),
         because the sampling is happening on the GPU either way. It stays at
         medium because 'high' can fall back to a genuinely more expensive path
         where that acceleration is missing, and there is nothing to buy with it
         — at a 1.3x upscale of already-soft footage, under this page's own film
         grain, the difference is not visible. */
      ctx.imageSmoothingQuality = 'medium';
      // Resizing clears the surface, so repaint where the scroll actually is.
      lastA = lastB = lastT = -1;
      paint(want, true);
    };

    // ---- draw, object-fit: cover -------------------------------------------
    // Falls back to the nearest decoded frame, so a half-loaded sequence still
    // paints something rather than flashing an empty canvas.
    const nearest = (i) => {
      if (ready[i]) return i;
      for (let k = i; k >= 0; k--) if (ready[k]) return k;
      for (let k = i; k < TOTAL_FRAMES; k++) if (ready[k]) return k;
      return -1;
    };

    const cover = (img, alpha) => {
      const cw = canvas.width;
      const ch = canvas.height;
      const ir = img.naturalWidth / img.naturalHeight;
      let dw, dh;
      if (cw / ch > ir) { dw = cw; dh = cw / ir; }
      else { dh = ch; dw = ch * ir; }
      ctx.globalAlpha = alpha;
      ctx.drawImage(img, (cw - dw) / 2, (ch - dh) / 2, dw, dh);
      ctx.globalAlpha = 1;
    };

    /* Adjacent frames are cross-faded rather than swapped — the same thing the
       portrait does, and for the same reason.
       A hundred frames across the document is a new frame every ~52px of
       scroll, which is under two notches of a mouse wheel. As hard cuts that
       is plainly steppy, and no amount of scrub smoothing fixes it: easing the
       index only spreads the same jumps over more time. Drawing frame N at
       full opacity and N+1 at the fractional part turns 100 discrete images
       into a continuous ramp, for one extra drawImage on a surface that was
       being repainted anyway.
       The blend is quantised to 1/16, which is 1600 distinct states across the
       run — one every ~3px of scroll, finer than the eye resolves — so a
       scroll that moves a hundredth of a frame does not redraw the canvas for
       a change nobody can see. */
    const paint = (value, force) => {
      const v = Math.max(0, Math.min(TOTAL_FRAMES - 1, value));
      const i = Math.floor(v);
      const t = Math.round((v - i) * 16) / 16;

      const a = nearest(i);
      if (a < 0) return; // nothing decoded yet
      const b = t > 0 ? nearest(Math.min(TOTAL_FRAMES - 1, i + 1)) : -1;
      if (!force && a === lastA && b === lastB && t === lastT) return;
      lastA = a; lastB = b; lastT = t;

      cover(frames[a], 1);
      if (b >= 0 && b !== a) cover(frames[b], t);
    };

    // ---- loader: sequential-ish with bounded concurrency --------------------
    const CONCURRENCY = 6;
    let cursor = 0;
    let inFlight = 0;

    const pump = () => {
      if (disposed) return;
      while (cursor < LAST && inFlight < CONCURRENCY) load(cursor++);
    };

    const load = (i) => {
      const mine = generation;
      inFlight++;
      const img = new Image();
      img.decoding = 'async';
      img.src = framePath(tier, i);
      frames[i] = img;

      const settle = () => {
        if (mine !== generation) return; // superseded by a tier change
        inFlight--;
        if (disposed) return;
        ready[i] = 1;
        readyCount++;
        progressRef.current?.(readyCount / LAST);
        /* Repaint if nothing is up yet, or if this is one of the two frames
           the current position actually wants — until now a neighbour will
           have been standing in for it. */
        const base = Math.floor(want);
        if (lastA === -1 || i === base || i === base + 1) paint(want, true);
        pump();
      };

      const fail = () => {
        if (mine !== generation) return;
        inFlight--;
        if (!disposed) pump();
      };

      // decode() warms the browser's decoded cache off the main thread so the
      // first drawImage for this frame doesn't stall a scroll tick.
      img.decode ? img.decode().then(settle, () => (img.complete ? settle() : fail()))
                 : (img.onload = settle, img.onerror = fail);
    };

    const restart = (next) => {
      generation++;
      tier = next;
      frames.forEach((img) => { if (img) img.src = ''; });
      frames.fill(undefined);
      ready.fill(0);
      readyCount = 0;
      cursor = 0;
      inFlight = 0;
      lastA = lastB = lastT = -1;
      pump();
    };

    resize();
    pump();

    // ---- drive the sequence from whole-document scroll ---------------------
    let tween;
    if (!reduceMotion) {
      const state = { f: 0 };
      tween = gsap.to(state, {
        f: TOTAL_FRAMES - 1,
        ease: 'none',
        /* Deliberately not snapped to whole frames any more. The fractional
           value is what paint() cross-fades on — snapping it would throw away
           the interpolation and put the hard cuts straight back. */
        scrollTrigger: {
          trigger: document.documentElement,
          start: 'top top',
          end: 'bottom bottom',
          /* The lag that makes a hundred discrete frames read as footage. It
             also decouples painting from the raw scroll event: the tween is
             updated on GSAP's ticker, which is rAF, so however many scroll
             events a trackpad fires they collapse into one paint per display
             refresh. */
          scrub: 0.45,
          invalidateOnRefresh: true,
        },
        onUpdate: () => {
          want = state.f;
          paint(want);
        },
      });
    }

    // ---- resize: debounced, and only when the size really changed ----------
    let rw = window.innerWidth;
    let rh = window.innerHeight;
    let widthChanged = false;
    let t;
    const onResize = () => {
      // Mobile browsers fire resize on address-bar show/hide; ignore height-only
      // jitter so we don't thrash layout mid-scroll.
      const w = window.innerWidth;
      const h = window.innerHeight;
      if (w === rw && Math.abs(h - rh) < 120) return;
      widthChanged ||= w !== rw;
      rw = w; rh = h;
      clearTimeout(t);
      t = setTimeout(() => {
        if (disposed) return;
        resize();

        // Only a width change can move the tier — the queries are written on
        // width and orientation, and orientation cannot change without it.
        if (widthChanged) {
          const next = pickTier();
          if (next !== tier) restart(next);
        }

        /* resize() has already repainted at `want`; this only matters when a
           tier swap wiped the buffers out from under it. */
        paint(want, true);

        /* Refresh only when the width moved. A height-only change is the
           address bar, and no trigger on the page depends on it — the full-
           height sections are measured in svh, which is the small viewport and
           stays put while the bar slides. Remeasuring anyway meant a full
           recalculation, and a scroll-position restore on top of it, in the
           middle of a scroll. */
        if (widthChanged) {
          widthChanged = false;
          ScrollTrigger.refresh();
        }
      }, 180);
    };
    window.addEventListener('resize', onResize, { passive: true });

    return () => {
      disposed = true;
      generation++;
      clearTimeout(t);
      window.removeEventListener('resize', onResize);
      tween?.scrollTrigger?.kill();
      tween?.kill();
      frames.forEach((img) => { if (img) img.src = ''; });
    };
  }, []);

  return <canvas ref={canvasRef} className="frame-canvas" aria-hidden="true" />;
}
