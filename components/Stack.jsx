import Figure from '@/components/Figure';
import { sections, skills } from '@/lib/content';

const meta = sections.find((s) => s.id === 'stack');

/* Split down the middle so the two columns hang either side of the channel.
   The footage here is hardware suspended in mid-air on both sides of frame;
   the section answers it literally, as a parts inventory. */
const half = Math.ceil(skills.length / 2);
const columns = [skills.slice(0, half), skills.slice(half)];

/**
 * 03 — the components, laid out.
 *
 * Deepest sustained brightness in the run (side luminance 112-150), so
 * everything here is on a plate.
 */
export default function Stack() {
  return (
    <section id="stack" className="section stack plane">
      <header className="stack-header side-l">
        <Figure mark={meta.figure} name={meta.label} />
        <h2 className="s-title reveal" data-from="l">
          What I reach for
        </h2>
        <p className="s-lede reveal" data-from="l">
          Listed by how close each part sits to the work, not alphabetically.
        </p>
      </header>

      {columns.map((column, ci) => (
        <div
          className={`stack-grid ${ci === 0 ? 'stack-col-l' : 'stack-col-r side-r'}`}
          key={ci}
        >
          {column.map((group, gi) => (
            <article
              className={`stack-group plate ${ci === 0 ? 'plate--l' : 'plate--r'} reveal`}
              data-from={ci === 0 ? 'l' : 'r'}
              data-cursor={group.group}
              key={group.group}
            >
              <div className="stack-head">
                <span className="plate-idx">
                  {String(ci * half + gi + 1).padStart(2, '0')}
                </span>
                <h3 className="stack-name">{group.group}</h3>
              </div>

              <p className="stack-note">{group.note}</p>

              <ul className="stack-items">
                {group.items.map((item) => (
                  <li className="stack-item" data-cursor={item} key={item}>
                    {item}
                  </li>
                ))}
              </ul>
            </article>
          ))}
        </div>
      ))}
    </section>
  );
}
