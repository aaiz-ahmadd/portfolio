/**
 * The drawing reference every section carries — a plate number, a name, and a
 * rule that runs out to the edge of the measure.
 *
 * It is the one repeated ornament on the page, and it is what ties the layout
 * to the exploded-view render behind it: the sections are numbered the way the
 * parts in the footage would be.
 */
export default function Figure({ mark, name, from = 'l' }) {
  return (
    <div className="figure reveal" data-from={from}>
      <span className="figure-ref">{mark}</span>
      <span className="figure-name">{name}</span>
    </div>
  );
}
