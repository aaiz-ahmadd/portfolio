'use client';

import { useEffect, useRef, useState } from 'react';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { sections } from '@/lib/content';
import { scrollToId } from '@/lib/scroll';

/* A finger travelling more than this between press and release was scrolling,
   not aiming. Below it, the touch was meant for the item. */
const DRAG_SLOP_PX = 10;

/**
 * The index down the left edge — the sections numbered the way plates in a
 * manual are, which is the same grammar the figure marks use.
 */
export default function IndexRail() {
  const [active, setActive] = useState('hero');

  /* On a phone this becomes a pill across the bottom of the screen, which is
     exactly where a thumb rests and flicks. A flick that begins on an item
     still ends in a click in most mobile browsers, so the page would launch
     itself at whichever section the thumb happened to be over. Record where
     the press started and throw the click away if the finger moved. */
  const press = useRef(null);

  useEffect(() => {
    const triggers = sections.map((s) => {
      const el = document.getElementById(s.id);
      if (!el) return null;
      return ScrollTrigger.create({
        trigger: el,
        start: 'top 55%',
        end: 'bottom 55%',
        onToggle: (self) => self.isActive && setActive(s.id),
      });
    });
    return () => triggers.forEach((t) => t?.kill());
  }, []);

  const onPointerDown = (e) => {
    press.current = { x: e.clientX, y: e.clientY };
  };

  const go = (e, id) => {
    e.preventDefault();

    /* A recorded press is what says a pointer was involved, so that is what
       gates the measurement. Click count would have been the obvious signal,
       but browsers don't agree on what a tap reports, and trusting it means a
       browser that says 0 for a tap loses the guard entirely. The one thing a
       keyboard activation cannot fake is a position: it fires at the origin,
       and no item on this rail sits in the corner of the viewport. */
    const from = press.current;
    press.current = null;
    const keyboard = e.clientX === 0 && e.clientY === 0;
    if (from && !keyboard) {
      const moved = Math.hypot(e.clientX - from.x, e.clientY - from.y);
      if (moved > DRAG_SLOP_PX) return;
    }

    scrollToId(id);
  };

  return (
    <nav className="idx" aria-label="Sections">
      {sections.map((s) => (
        <a
          key={s.id}
          href={`#${s.id}`}
          className="idx-item"
          data-cursor={s.label}
          aria-current={active === s.id ? 'true' : undefined}
          onPointerDown={onPointerDown}
          onClick={(e) => go(e, s.id)}
        >
          <span aria-hidden="true">{s.index}</span>
          <span className="idx-tick" aria-hidden="true" />
          <span className="idx-label">{s.label}</span>
        </a>
      ))}
    </nav>
  );
}
