/* ============================================================
   Frame sequence: resolution tiers
   ------------------------------------------------------------
   Two places have to agree on which tier a device gets: the
   <link rel="preload"> in the document head, which fires before any
   JS runs, and the loader in FrameSequence. When they disagree the
   browser fetches a frame nobody ever paints and logs
   "resource was preloaded using link preload but not used".

   So the boundaries live here once, written as media queries, and
   both sides read them — the head as `media` attributes, the loader
   through matchMedia. They cannot drift.

   Source: sm 640x800 (4:5), md 1280x720, lg 1920x1080.
   ============================================================ */

export const TOTAL_FRAMES = 100;

/* The frames are served with `immutable, max-age=31536000` (next.config.mjs),
   which is the right header for them and a trap without this. The filenames
   are indices, not content hashes, so replacing the sequence reuses every URL
   — and `immutable` means a returning browser will not so much as revalidate.
   Swapping the footage without moving it therefore leaves anyone who saw the
   old site pinned to it for a year. This is what makes the header honest:
   bump it whenever the contents of real-frames/ change, and every frame gets
   a URL nothing has ever cached.

   Read by scripts/build-frames.mjs too, so the directory it writes and the
   path the page requests cannot disagree. */
export const FRAMES_VERSION = 'v4';

/* The phone tier is a 4:5 centre crop, not a smaller copy of the same
   picture — see scripts/build-frames.mjs for why. That makes these queries
   orientation-sensitive in a way they were not before: a 4:5 frame covering a
   landscape viewport would scale to the width and leave a thin horizontal
   band of a shot whose whole subject is vertical. So the cropped tier is
   claimed only by portrait phones, and a phone turned sideways falls through
   to md, which is 16:9 and framed for it.

   Ranges stay mutually exclusive, so exactly one preload link is ever live. */
export const FRAME_TIERS = [
  { tier: 'sm', media: '(max-width: 540px) and (orientation: portrait)' },
  {
    tier: 'md',
    media: '(max-width: 540px) and (orientation: landscape), (min-width: 541px) and (max-width: 1200px)',
  },
  { tier: 'lg', media: '(min-width: 1201px)' },
];

export const framePath = (tier, i) =>
  `/frames/${FRAMES_VERSION}/${tier}/${String(i + 1).padStart(4, '0')}.webp`;

/**
 * Which tier this device should load. Falls back to md if no query
 * matches, which can only happen in a non-browser environment.
 */
export function pickTier() {
  const hit = FRAME_TIERS.find((t) => window.matchMedia(t.media).matches);
  const tier = hit ? hit.tier : 'md';

  // Metered or genuinely slow connections drop to the lightest tier the
  // viewport can actually use. Not unconditionally sm: on anything that isn't
  // a portrait phone that would hand back the 4:5 crop, and saving 0.65MB is
  // not worth showing a horizontal slice of a vertical subject. md is the
  // floor everywhere else.
  const conn = navigator.connection || {};
  if (conn.saveData === true || /^(slow-)?2g$/.test(conn.effectiveType || '')) {
    return tier === 'sm' ? 'sm' : 'md';
  }
  return tier;
}
