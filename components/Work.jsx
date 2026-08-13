import Figure from '@/components/Figure';
import { projects, sections } from '@/lib/content';

const meta = sections.find((s) => s.id === 'work');

/**
 * 04 — the deepest point, and then the reassembly.
 *
 * The projects fill the two columns either side of the reserved centre, so the
 * lens the camera is pointed down stays visible the whole way through and the
 * pairs read as callouts hung off an exploded diagram rather than as a grid of
 * cards. Five of them means the last row is half empty, which is left alone —
 * the asymmetry is better than padding the list to make it even.
 */
export default function Work() {
  return (
    <section id="work" className="section work plane">
      <header className="work-header side-l">
        <Figure mark={meta.figure} name={meta.label} />
        <h2 className="s-title reveal" data-from="l">
          Things I built,
          <br />
          and what each
          <br />
          one cost me
        </h2>
        <p className="s-lede reveal" data-from="l">
          Five projects. Every one of them shipped further than it had to.
        </p>
      </header>

      <ol className="work-list plane">
        {projects.map((p, i) => {
          const side = i % 2 === 0 ? 'l' : 'r';
          return (
            <li className="work-item reveal" data-from={side} key={p.name}>
              <a
                className={`work-card plate plate--${side}`}
                href={p.href}
                target="_blank"
                rel="noreferrer noopener"
              >
                <div className="work-top">
                  <span className="plate-idx">{String(i + 1).padStart(2, '0')}</span>
                  <span className="work-tags">
                    {p.highlight && <span className="work-flag">{p.highlight}</span>}
                    <span>{p.kind}</span>
                    <span>{p.year}</span>
                  </span>
                </div>

                <h3 className="work-name">
                  {p.name}
                  <span className="work-arrow" aria-hidden="true">
                    ↗
                  </span>
                </h3>

                <p className="work-summary">{p.summary}</p>
                <p className="work-detail">{p.detail}</p>

                <ul className="work-stack">
                  {p.stack.map((s) => (
                    <li key={s}>{s}</li>
                  ))}
                </ul>
              </a>
            </li>
          );
        })}
      </ol>
    </section>
  );
}
