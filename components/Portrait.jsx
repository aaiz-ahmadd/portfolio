'use client';

import { useEffect, useRef } from 'react';
import gsap from 'gsap';

import { PORTRAIT_FRAMES, portraitPath, pickPortraitTier } from '@/lib/portrait';

/**
 * A 25-frame sequence that goes from composed to a smile, scrubbed by the
 * scroll past it and nothing else.
 *
 * It used to be a large card in the hero. Against footage this cinematic that
 * competed with the shot and read as a template, so it moved here — beside the
 * sealed orb, at the darkest and quietest point in the run. It is the human
 * beat before the machine opens, and it is better for being smaller.
 *
 * Three decisions worth knowing about:
 *
 * 1. It is in normal flow, not fixed and not pinned. That is the whole reason
 *    it can't follow you into the next section: there is no positioning to
 *    undo at the boundary, because there was never any.
 *
 * 2. Adjacent frames are cross-faded rather than swapped. 25 frames across
 *    half a viewport of scroll is a new frame every ~18px — as hard cuts that
 *    reads as a stutter, which is exactly what a smile can't afford. Drawing
 *    frame N at full opacity and frame N+1 at the fractional part turns 25
 *    discrete images into a continuous ramp. The footage barely moves between
 *    frames (measured: under 1/255 mean difference), so the blend reads as
 *    motion rather than as a dissolve.
 *
 * 3. Loading waits until the section is near. Frame 1 comes down with the
 *    document as a preload — it is the resting state — but the other 24 have
 *    no business competing with the backdrop frames the loader is waiting on,
 *    and this sits a full screen below the fold.
 */
export default function Portrait() {
  const rootRef = useRef(null);
  const mediaRef = useRef(null);
  const canvasRef = useRef(null);

  useEffect(() => {
    const root = rootRef.current;
    const media = mediaRef.current;
    const canvas = canvasRef.current;
    if (!root || !media || !canvas) return;

    const ctx = canvas.getContext('2d', { alpha: false, desynchronized: true });
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const tier = pickPortraitTier();

    const N = PORTRAIT_FRAMES;
    const frames = new Array(N);
    const ready = new Uint8Array(N);
    let disposed = false;

    // Reduced motion skips the sequence and rests on the smile — the payoff
    // without the movement.
    let want = reduce ? N - 1 : 0;

    // ---- sizing ------------------------------------------------------------
    const resize = () => {
      const rect = media.getBoundingClientRect();
      if (!rect.width || !rect.height) return;
      // 2x is the ceiling the sources are cut for and the card is small, so the
      // cost of the full ratio here is trivial — unlike the backdrop, which
      // covers the whole viewport and is capped lower.
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      const w = Math.round(rect.width * dpr);
      const h = Math.round(rect.height * dpr);
      if (w === canvas.width && h === canvas.height) return;
      canvas.width = w;
      canvas.height = h;
      // Resizing the backing store resets the context, so this is re-set here
      // rather than once at setup.
      ctx.imageSmoothingQuality = 'high';
      paint(want, true);
    };

    // ---- painting ----------------------------------------------------------
    // Falls back to the nearest decoded frame so a half-loaded sequence still
    // paints something rather than flashing the empty canvas.
    const nearest = (i) => {
      if (ready[i]) return i;
      for (let k = i; k >= 0; k--) if (ready[k]) return k;
      for (let k = i; k < N; k++) if (ready[k]) return k;
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

    let lastA = -1;
    let lastB = -1;
    let lastT = -1;

    const paint = (f, force) => {
      const v = Math.max(0, Math.min(N - 1, f));
      const i = Math.floor(v);
      // Quantise the blend to 1/32. Twenty-five frames at 32 steps each is 800
      // distinct states, far finer than the eye resolves — and it means a
      // scroll that moves a few hundredths of a frame doesn't redraw the canvas
      // for a change nobody can see.
      const t = Math.round((v - i) * 32) / 32;

      const a = nearest(i);
      if (a < 0) return;
      const b = t > 0 ? nearest(Math.min(N - 1, i + 1)) : -1;
      if (!force && a === lastA && b === lastB && t === lastT) return;
      lastA = a; lastB = b; lastT = t;

      cover(frames[a], 1);
      if (b >= 0 && b !== a) cover(frames[b], t);
    };

    // ---- loading -----------------------------------------------------------
    const load = (i, onSettle) => {
      const img = new Image();
      img.decoding = 'async';
      img.src = portraitPath(tier, i);
      frames[i] = img;

      const settle = () => {
        if (disposed) return;
        ready[i] = 1;
        paint(want, true);
        onSettle?.();
      };
      const fail = () => { if (!disposed) onSettle?.(); };

      // decode() warms the browser's decoded cache off the main thread, so the
      // first drawImage of a frame never stalls a scroll tick.
      img.decode
        ? img.decode().then(settle, () => (img.complete ? settle() : fail()))
        : ((img.onload = settle), (img.onerror = fail));
    };

    // Frame 1 is the resting state and was preloaded with the document.
    load(0);
    if (reduce) load(N - 1);

    let cursor = 1;
    let inFlight = 0;
    let started = false;
    const CONCURRENCY = 4;

    const pump = () => {
      if (disposed) return;
      while (cursor < N && inFlight < CONCURRENCY) {
        inFlight++;
        load(cursor++, () => { inFlight--; pump(); });
      }
    };

    /* Start fetching a screen and a half early — far enough out that the
       frames have landed before the scrub reaches them, late enough that they
       are never racing the backdrop for bandwidth on first paint. */
    const io = new IntersectionObserver(
      (entries) => {
        if (!entries.some((e) => e.isIntersecting)) return;
        io.disconnect();
        if (started || disposed || reduce) return;
        started = true;
        pump();
      },
      { rootMargin: '150% 0px' }
    );
    io.observe(root);

    // ---- drive it from its own travel through the viewport ------------------
    let tween;
    if (!reduce) {
      const state = { f: 0 };
      tween = gsap.to(state, {
        f: N - 1,
        ease: 'none',
        scrollTrigger: {
          /* Measured off the element itself rather than off the section, so
             the smile lands while the face is still comfortably on screen
             whatever the viewport height. A section-relative range finished
             around half a screen too late on a laptop and too early on a
             phone; this one holds on both because it is the card's own
             travel that defines it. */
          trigger: root,
          start: 'top 85%',
          end: 'top 32%',
          scrub: 0.55,
          invalidateOnRefresh: true,
        },
        onUpdate: () => {
          want = state.f;
          paint(want);
        },
      });
    }

    // The card's width is set in vw, so it only resizes when the viewport
    // really changes — an observer here costs nothing on the address-bar
    // height jitter a window resize listener would fire on.
    const ro = new ResizeObserver(resize);
    ro.observe(media);

    return () => {
      disposed = true;
      io.disconnect();
      ro.disconnect();
      tween?.scrollTrigger?.kill();
      tween?.kill();
      frames.forEach((img) => { if (img) img.src = ''; });
    };
  }, []);

  return (
    <div className="portrait" ref={rootRef}>
      <div className="portrait-media" ref={mediaRef}>
        <canvas
          ref={canvasRef}
          className="portrait-canvas"
          role="img"
          aria-label="Aaiz Ahmad, who breaks into a smile as the page scrolls"
        />
      </div>
    </div>
  );
}
