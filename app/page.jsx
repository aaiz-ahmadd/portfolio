'use client';

import { useEffect, useRef, useState } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useGSAP } from '@gsap/react';

import FrameSequence from '@/components/FrameSequence';
import { TOTAL_FRAMES } from '@/lib/frames';
import { scrollToId } from '@/lib/scroll';
import IndexRail from '@/components/IndexRail';
import Dimmer from '@/components/Dimmer';
import Hero from '@/components/Hero';
import Approach from '@/components/Approach';
import Education from '@/components/Education';
import Stack from '@/components/Stack';
import Work from '@/components/Work';
import Contact from '@/components/Contact';
import Cursor from '@/components/Cursor';

gsap.registerPlugin(ScrollTrigger, useGSAP);

/* A phone's address bar collapses as you scroll, and the browser reports that
   as a resize. ScrollTrigger's default response is a full refresh: remeasure
   every trigger, then put the scroll position back. Mid-scroll that is both
   the single most expensive thing on the page and a fight with the finger
   still on the glass — it is the hitch felt on the way down.
   The heights that matter here are already written in svh, which is the small
   viewport and doesn't move when the bar does, so there is nothing to
   remeasure. Ignore vertical-only resizes on touch devices; a real orientation
   change alters the width and still refreshes. */
ScrollTrigger.config({ ignoreMobileResize: true });

/* The hero only ever shows the first fifth of the run, so hold the curtain for
   a handful of frames rather than a percentage of the whole sequence —
   waiting on a fixed fraction of 100 frames means megabytes of blank screen on
   a slow connection for footage nobody has scrolled to yet. */
const WARMUP_FRAMES = 8;
const WARMUP = WARMUP_FRAMES / TOTAL_FRAMES;
const MAX_WAIT_MS = 2800;

export default function Page() {
  const root = useRef(null);
  // The veil sits outside <main>, so it can't be reached by a scoped selector.
  const veilRef = useRef(null);
  const [progress, setProgress] = useState(0);
  const [ready, setReady] = useState(false);

  /* Frames report progress a hundred times. Once the loader is gone nobody is
     looking at it, so stop re-rendering the whole tree during the load — that
     work competes with decoding frames and with the first scroll. */
  const doneRef = useRef(false);

  const onProgress = (p) => {
    if (doneRef.current) return;
    setProgress(p);
    if (p >= WARMUP) {
      doneRef.current = true;
      setReady(true);
    }
  };

  // Never trap someone behind the loader. If the network is slow (or an image
  // 404s), show the page anyway — the canvas fills in as frames arrive.
  useEffect(() => {
    const t = setTimeout(() => {
      doneRef.current = true;
      setReady(true);
    }, MAX_WAIT_MS);
    return () => clearTimeout(t);
  }, []);

  /* In-page links smooth themselves now that the CSS no longer does it for
     them — see lib/scroll.js for why that had to go. Delegated, so anything
     added to a section later is covered without it becoming a client component
     just to hold a handler. */
  useEffect(() => {
    const onClick = (e) => {
      if (e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey) return;
      const a = e.target.closest?.('a[href^="#"]');
      if (!a || a.closest('.idx')) return; // the rail runs its own tap guard
      const id = a.getAttribute('href').slice(1);
      if (!id || !document.getElementById(id)) return;
      e.preventDefault();
      scrollToId(id);
    };
    document.addEventListener('click', onClick);
    return () => document.removeEventListener('click', onClick);
  }, []);

  // --- opening beat: runs once the loader clears ---------------------------
  useGSAP(
    () => {
      const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
      if (reduce || !ready) return;

      const intro = gsap.timeline({ defaults: { ease: 'expo.out' } });
      intro
        /* Each name line sits in its own overflow-hidden row, so this slides
           them up from behind a hard edge rather than fading them in — the
           same gesture the footage makes as the burst settles.
           130 rather than 100 because the clipping row carries 0.16em of
           padding to keep the glyphs off its edges (see .hero-line): that
           moves the clip edge down, so the line has to start further below it
           to be genuinely hidden. The geometry works out at 119%; this leaves
           margin. */
        .from('[data-hero-line]', { yPercent: 130, duration: 1.25, stagger: 0.09 })
        .from('.hero-eyebrow', { opacity: 0, y: 12, duration: 0.75 }, 0.18)
        .from('.hero-meta div', { opacity: 0, y: 16, duration: 0.8, stagger: 0.06 }, 0.5)
        .from('.hero-cue', { opacity: 0, y: 14, duration: 0.8 }, 0.68);
    },
    { scope: root, dependencies: [ready] }
  );

  // --- scroll behaviour: built once ----------------------------------------
  useGSAP(
    () => {
      const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
      if (reduce) return; // CSS already puts everything in its resting state

      /* --- keep text readable as the footage brightens ---------------------
         Ramp a flat veil against the measured luminance of the frames. The
         stops are sampled, not guessed: decoding all 100 frames and taking the
         90th-percentile luminance of the left and right thirds — the only
         places copy is ever put — gives roughly

           frames   1-20   83-91    the burst, diffuse
           frames  20-32   58-67    the sealed orb; the darkest of the run
           frames  32-52   87-148   it opens, hardware enters the sides
           frames  52-88  104-150   the interior, brightest sustained stretch
           frames  88-100  60-92    reassembly, then the second burst

         Veiled by the amounts below, that field lands in the 55-70/255 band
         the palette was measured against, the whole way down. Note it comes
         *down* through the middle section rather than up: the plates under
         that stretch already hold the copy, so the veil only has to protect
         the section titles floating outside them — and over-veiling there
         would flatten the best footage in the run into mud for no gain.

         Opacity only, so it stays a compositor-level change. */
      gsap.to(veilRef.current, {
        keyframes: [
          { opacity: 0.16, duration: 0.22 }, // into the sealed orb — let it go dark
          { opacity: 0.46, duration: 0.12 }, // it opens, and the sides light up
          { opacity: 0.56, duration: 0.21 }, // the components
          { opacity: 0.54, duration: 0.23 }, // deepest interior
          { opacity: 0.3,  duration: 0.12 }, // reassembly, field falls away
          { opacity: 0.34, duration: 0.1  }, // the second burst
        ],
        ease: 'none',
        scrollTrigger: {
          trigger: document.documentElement,
          start: 'top top',
          end: 'bottom bottom',
          scrub: 0.4,
        },
      });

      /* batch() coalesces everything entering within a frame into one tween,
         which is far cheaper than one ScrollTrigger firing per element.
         Each element is revealed exactly once. Without this guard, catchUp()
         re-fires on every refresh/scrollEnd and `overwrite` kills the tween
         that's already mid-flight, restarting it from wherever it had got to —
         the reveal crawls and never actually lands. */
      const handled = new WeakSet();

      /* x and y are both driven to zero because the resting offset is a single
         translate3d whose axis depends on which side of the channel the
         element belongs to — content enters from the outside edge, so the page
         assembles outward the way the hardware in the footage does. */
      const show = (els, duration = 0.9, stagger = 0.07) => {
        const fresh = els.filter((el) => !handled.has(el));
        if (!fresh.length) return;
        fresh.forEach((el) => handled.add(el));
        /* Promote only what is about to move, and only while it moves. The
           stylesheet deliberately does not carry this hint — see .reveal
           there. */
        gsap.set(fresh, { willChange: 'opacity, transform' });
        gsap.to(fresh, {
          opacity: 1,
          x: 0,
          y: 0,
          duration,
          stagger,
          ease: 'power3.out',
          overwrite: 'auto',
          onComplete: () => gsap.set(fresh, { willChange: 'auto' }),
        });
      };

      ScrollTrigger.batch('.section:not(.hero) .reveal', {
        start: 'top 88%',
        once: true,
        interval: 0.08,
        batchMax: 6,
        onEnter: (batch) => show(batch),
        onEnterBack: (batch) => show(batch),
      });

      /* Safety net. onEnter only fires when the scroll actually crosses into a
         trigger's range — jump straight past it (an index click, a hash link,
         a fast flick, a browser restoring scroll on reload) and that content
         would sit at opacity 0 forever. After any scroll settles, reveal
         whatever is already on screen but still hidden. */
      const catchUp = () => {
        /* The 0.9 keeps the net from firing on things the reader has not
           reached yet. At the end of the document that reasoning inverts:
           nothing can scroll any higher, so anything still on screen is as
           reached as it will ever be, and holding it to the same cutoff leaves
           whatever rests in the last tenth — the colophon, on a short viewport
           — at opacity 0 permanently. */
        const doc = document.documentElement;
        const atEnd = window.scrollY >= doc.scrollHeight - window.innerHeight - 2;
        const cutoff = atEnd ? window.innerHeight : window.innerHeight * 0.9;
        const missed = gsap.utils
          .toArray('.section:not(.hero) .reveal')
          .filter((el) => !handled.has(el) && el.getBoundingClientRect().top < cutoff);
        if (missed.length) show(missed, 0.5, 0.03);
      };

      ScrollTrigger.addEventListener('scrollEnd', catchUp);
      ScrollTrigger.addEventListener('refresh', catchUp);
      catchUp(); // and cover the initial paint

      // useGSAP reverts tweens for us, but these listeners are ours to remove.
      const cleanup = () => {
        ScrollTrigger.removeEventListener('scrollEnd', catchUp);
        ScrollTrigger.removeEventListener('refresh', catchUp);
      };

      /* --- section titles drift very slightly against the scroll ------------
         yPercent rather than y, so it composes with the reveal above instead
         of fighting it for the same property. Transform-only, so it stays on
         the compositor. */
      gsap.utils.toArray('.s-title').forEach((el) => {
        gsap.to(el, {
          yPercent: -8,
          ease: 'none',
          scrollTrigger: {
            trigger: el,
            start: 'top bottom',
            end: 'bottom top',
            scrub: 0.6,
          },
        });
      });

      return cleanup;
    },
    { scope: root }
  );

  return (
    <>
      <div className="loader" data-done={ready ? 'true' : 'false'} aria-hidden={ready}>
        <p className="loader-name">Aaiz Ahmad</p>
        <div
          className="loader-bar"
          role="progressbar"
          aria-label="Loading"
          aria-valuenow={Math.round(Math.min(progress / WARMUP, 1) * 100)}
        >
          <div
            className="loader-fill"
            style={{ width: `${Math.min(progress / WARMUP, 1) * 100}%` }}
          />
        </div>
        <p className="loader-pct">
          {String(Math.round(Math.min(progress / WARMUP, 1) * 100)).padStart(3, '0')}
        </p>
      </div>

      <FrameSequence onProgress={onProgress} />
      <div className="veil" ref={veilRef} aria-hidden="true" />
      <div className="scrim" aria-hidden="true" />
      {/* Before .grain and on the same stacking index, so the grain still
          textures the dimmed image instead of being dimmed by it. */}
      <div className="dusk" aria-hidden="true" />
      <div className="grain" aria-hidden="true" />

      <IndexRail />
      <Dimmer />
      <Cursor />

      <main className="shell" ref={root}>
        <Hero />
        <Approach />
        <Education />
        <Stack />
        <Work />
        <Contact />
      </main>
    </>
  );
}
