/* ============================================================
   In-page jumps
   ------------------------------------------------------------
   This used to be one line of CSS — `html { scroll-behavior: smooth }` —
   and that line was the reason the page threw itself at the end of the
   sequence on a phone.

   ScrollTrigger doesn't only read the scroll position, it writes it: every
   refresh() restores the position it recorded before recalculating. It does
   that with window.scrollTo(x, y), which obeys CSS scroll-behavior. So with
   smoothing on globally, an internal restore stopped being instant and became
   an animation — and anything that landed on top of it (a finger still on the
   glass, another refresh) fought it. On desktop refresh() is rare. On a phone
   the address bar collapsing fires a resize mid-scroll, so it isn't.

   Now the smoothing is explicit, attached only to a real click, and
   ScrollTrigger's own writes stay instant.
   ============================================================ */

export function scrollToId(id) {
  const el = document.getElementById(id);
  if (!el) return;

  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  window.scrollTo({
    top: el.getBoundingClientRect().top + window.scrollY,
    behavior: reduce ? 'auto' : 'smooth',
  });
}
