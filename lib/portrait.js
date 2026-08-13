/* ============================================================
   Hero portrait: the smile sequence
   ------------------------------------------------------------
   Same contract as lib/frames.js — the head preloads the resting
   frame before any JS runs, and the component picks a tier at
   runtime. Both read the boundaries from here, so the tier that
   gets preloaded is always the tier that gets painted.

   Built by scripts/build-portrait.mjs out of smiling-frames/.
   Source is 4:5, sm 460px wide, lg 780px.
   ============================================================ */

/* 25, not the 30 files in smiling-frames/ — the export came from a GIF and
   five frames repeat their predecessor byte for byte. The build script drops
   them; see the note there. If the source is ever re-exported, this number
   comes from that script's output. */
export const PORTRAIT_FRAMES = 25;

/* One boundary, and it is the same 760px the hero grid changes shape at:
   below it the card sits beside the name at roughly 216px wide, above it it
   takes its own column and grows to 400px. */
export const PORTRAIT_TIERS = [
  { tier: 'sm', media: '(max-width: 759px)' },
  { tier: 'lg', media: '(min-width: 760px)' },
];

export const portraitPath = (tier, i) =>
  `/portrait/${tier}/${String(i + 1).padStart(4, '0')}.webp`;

export function pickPortraitTier() {
  const conn = navigator.connection || {};
  // Same trade as the backdrop: on a metered or 2G connection take the light
  // tier whatever the screen says, and accept that one preloaded frame goes
  // unused in exchange for 430KB.
  if (conn.saveData === true || /^(slow-)?2g$/.test(conn.effectiveType || '')) return 'sm';

  const hit = PORTRAIT_TIERS.find((t) => window.matchMedia(t.media).matches);
  return hit ? hit.tier : 'lg';
}
