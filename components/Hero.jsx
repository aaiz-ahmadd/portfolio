import { heroEyebrow, heroLines, heroMeta } from '@/lib/content';

/**
 * 00 — the light burst.
 *
 * The centre of this stretch is the hottest thing in the whole run (90th-
 * percentile luminance ~169-184 against ~85 at the sides), so nothing sits
 * there. The name goes low and left, the metadata low and right, and the
 * upper middle is left entirely to the footage. The type frames the light
 * instead of competing with it.
 */
export default function Hero() {
  return (
    <section id="hero" className="section hero plane" aria-label="Introduction">
      <p className="hero-eyebrow mono">{heroEyebrow}</p>

      <h1 className="hero-name">
        {heroLines.map((line) => (
          /* The clipping row is the parent; the child is what slides. Two
             elements per line so the opening move can come up from behind a
             hard edge rather than fading in. */
          <span className="hero-line" key={line}>
            <span data-hero-line>{line}</span>
          </span>
        ))}
      </h1>

      <div className="hero-foot">
        <dl className="hero-meta">
          {heroMeta.map(({ label, value }) => (
            <div key={label}>
              <dt>{label}</dt>
              <dd>{value}</dd>
            </div>
          ))}
        </dl>

        {/* Names the interaction and the narrative at once — the orb behind
            this really does open, and only scrolling opens it. */}
        <p className="hero-cue">
          Scroll to open
          <span className="hero-cue-track" aria-hidden="true" />
        </p>
      </div>
    </section>
  );
}
