/* @layer renderer-components @kind component */
/**
 * A short value or state on a small mono chip. The tone picks the colour, so a
 * status line, a table cell and a read-only setting all draw the same chip.
 */
import type { ChipProps } from './Chip.type';
import './Chip.css';

const Chip = (props: ChipProps) => {
  const { tone = 'neutral', caps = false, className = '', children, ...rest } = props;

  return (
    <span className={`chip${className ? ` ${className}` : ''}`} data-tone={tone} data-caps={caps ? '' : undefined} {...rest}>
      {children}
    </span>
  );
};

export { Chip };
