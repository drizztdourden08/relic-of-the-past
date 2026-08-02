/* @layer renderer-components @kind component */
/**
 * A scrollable region — the design-system's replacement for an ad-hoc
 * `<div style={{ overflow: 'auto' }}>`.
 *
 * Two things come with it that a bare overflow does not: scrolling animates
 * instead of jumping (which also makes `scrollIntoView` on a child glide), and
 * the scrollbar gets the one treatment used everywhere rather than each
 * container inventing its own. Any other div attribute — `role`, `onScroll`, a
 * ref — passes straight through, and `className` is merged onto the same
 * element, so an existing padding/layout class can stay exactly where it was
 * while the scrolling moves in here.
 */
import type { ScrollAreaProps } from './ScrollArea.type';
import './ScrollArea.css';

const ScrollArea = (props: ScrollAreaProps) => {
  const { axis = 'y', className = '', children, ...rest } = props;

  return (
    <div className={`scroll-area${className ? ` ${className}` : ''}`} data-axis={axis} {...rest}>
      {children}
    </div>
  );
};

export { ScrollArea };
