/* @layer renderer-components @kind component */
/**
 * A short definition list: one line per entry, the term leading in gold and
 * the detail following it in the surrounding text colour. A real `dl`, so a
 * reader hears "term: detail" once per line instead of one long paragraph —
 * the colon is in the markup, not in a pseudo-element, for exactly that
 * reason. Size and colour of the detail are inherited, so the caller's own
 * class decides how big the block is.
 */
import './TermList.css';
import type { TermListProps } from './TermList.type';

const TermList = (props: TermListProps) => {
  const { items, className = '' } = props;

  return (
    <dl className={`term-list${className ? ` ${className}` : ''}`}>
      {items.map(({ term, detail }) => (
        <div className="term-list__item" key={term}>
          <dt className="term-list__term">{`${term}:`}</dt>
          <dd className="term-list__detail">{detail}</dd>
        </div>
      ))}
    </dl>
  );
};

export { TermList };
