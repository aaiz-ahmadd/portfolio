import Figure from '@/components/Figure';
import Portrait from '@/components/Portrait';
import { about, profile, sections } from '@/lib/content';

const meta = sections.find((s) => s.id === 'approach');

/**
 * 01 — the sealed orb.
 *
 * The darkest stretch of the run: side luminance drops to ~58-67, lower than
 * anywhere else. So this is the one section with nothing between the words and
 * the footage — no plates, no panels. It is the quietest moment on the page and
 * the layout lets it stay quiet.
 *
 * The orb sits dead centre and the copy sits either side of it, which puts the
 * subject inside a callout without drawing one.
 */
export default function Approach() {
  return (
    <section id="approach" className="section section--tall approach plane">
      <div className="side-l">
        <Figure mark={meta.figure} name={meta.label} />

        <h2 className="approach-lede reveal" data-from="l">
          {about.lede}
        </h2>

        <div className="approach-body">
          {about.body.map((para, i) => (
            <p className="reveal" data-from="l" key={i}>
              {para}
            </p>
          ))}
        </div>
      </div>

      <div className="side-r approach-aside">
        <div className="reveal" data-from="r">
          <Portrait />
        </div>

        <dl className="approach-facts reveal" data-from="r">
          <div>
            <dt className="mono">Currently</dt>
            <dd>Second semester, BS Computer Science at ITU</dd>
          </div>
          <div>
            <dt className="mono">Elsewhere</dt>
            <dd>
              <a href={profile.github} target="_blank" rel="noreferrer noopener">
                GitHub
              </a>
              {' · '}
              <a href={profile.linkedin} target="_blank" rel="noreferrer noopener">
                LinkedIn
              </a>
            </dd>
          </div>
        </dl>
      </div>
    </section>
  );
}
