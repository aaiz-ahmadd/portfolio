import Figure from '@/components/Figure';
import { certifications, education, sections } from '@/lib/content';

const meta = sections.find((s) => s.id === 'education');

/**
 * 02 — the orb opens.
 *
 * The sides start to heat here (90th-percentile luminance climbing 87 -> 148,
 * with specular peaks past 240 off the bare hardware), so this is the first
 * section that puts its copy on plates rather than floating it.
 *
 * Laid out as a descent down a spine, most recent first — which is both how a
 * timeline reads and what the camera is doing behind it.
 */
export default function Education() {
  return (
    <section id="education" className="section education plane">
      <header className="edu-header side-l">
        <Figure mark={meta.figure} name={meta.label} />
        <h2 className="s-title reveal" data-from="l">
          Where the
          <br />
          fundamentals
          <br />
          came from
        </h2>
        <p className="s-lede reveal" data-from="l">
          Three schools, one direction. The C++ started early and never stopped.
        </p>
      </header>

      <ol className="edu-list edu-body">
        {education.map((e) => (
          <li className="edu-item reveal" data-from="l" data-status={e.status} key={e.school}>
            <article className="plate plate--l" data-cursor={e.abbr || e.school}>
              <div className="edu-head">
                <h3 className="edu-school" data-cursor={e.abbr || e.school}>{e.school}</h3>
                <p className="edu-metric">
                  <b>{e.metric}</b>
                  <span>{e.metricLabel}</span>
                </p>
              </div>

              <p className="edu-cred">{e.credential}</p>

              <div className="edu-foot">
                <span>
                  {e.from} — {e.to}
                </span>
                <span>{e.place}</span>
                <span className="edu-note">{e.note}</span>
              </div>
            </article>
          </li>
        ))}
      </ol>

      <aside className="edu-side side-r">
        <p className="mono reveal" data-from="r">
          Certifications
        </p>
        <div className="certs plate plate--r reveal" data-from="r">
          {certifications.map((c) =>
            c.href ? (
              <a
                className="cert"
                data-cursor={c.issuer || 'Coursera'}
                href={c.href}
                target="_blank"
                rel="noreferrer noopener"
                key={c.name}
              >
                <span className="cert-name">{c.name}</span>
                <span className="cert-issuer">{c.issuer}</span>
              </a>
            ) : (
              <div className="cert" data-cursor={c.issuer || 'Coursera'} key={c.name}>
                <span className="cert-name">{c.name}</span>
                <span className="cert-issuer">{c.issuer}</span>
              </div>
            )
          )}
        </div>
      </aside>
    </section>
  );
}
