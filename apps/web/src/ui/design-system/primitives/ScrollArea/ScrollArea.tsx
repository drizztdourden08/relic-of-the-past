/* @layer renderer-components @kind component */
/**
 * A scrollable region — the design-system's replacement for an ad-hoc
 * `<div style={{ overflow: 'auto' }}>`.
 *
 * Two things come with it that a bare overflow does not: scrolling animates
 * instead of jumping (which also makes `scrollIntoView` on a child glide), and
 * the scrollbar gets the one treatment used everywhere rather than each
 * container inventing its own. Any other div attribute — `role`, a `ref` — passes
 * straight through, and `className` is merged onto the same element, so an
 * existing padding/layout class can stay exactly where it was while the
 * scrolling moves in here.
 *
 * `onScroll` and `scrollTo` are the two hooks a parent needs to keep a second
 * `ScrollArea` in lockstep (e.g. a "current vs proposed" diff view) — see
 * behavior/create-scroll-sync-controller.ts for the framework-free mechanism
 * behind them, including why a synced `scrollTo` never echoes back through
 * `onScroll`.
 */
import { useEffect, useMemo, useRef } from 'react';
import { createScrollSyncController } from './behavior/create-scroll-sync-controller';
import { setNodeOnRef } from './behavior/set-node-on-ref';
import type { ScrollAreaProps } from './ScrollArea.type';
import type { UIEvent } from 'react';
import './ScrollArea.css';

const ScrollArea = (props: ScrollAreaProps) => {
  const { axis = 'y', className = '', children, onScroll, scrollTo, ref, ...rest } = props;

  const nodeRef = useRef<HTMLDivElement | null>(null);
  const controller = useMemo(() => createScrollSyncController(() => nodeRef.current), []);

  useEffect(() => {
    controller.applyScrollTo(scrollTo ?? {});
  }, [controller, scrollTo?.top, scrollTo?.left]);

  const handleScroll = (event: UIEvent<HTMLDivElement>): void => {
    const current = { top: event.currentTarget.scrollTop, left: event.currentTarget.scrollLeft };
    controller.handleScroll(current, onScroll);
  };

  return (
    <div
      ref={(node) => {
        nodeRef.current = node;
        setNodeOnRef(ref, node);
      }}
      className={`scroll-area${className ? ` ${className}` : ''}`}
      data-axis={axis}
      onScroll={onScroll ? handleScroll : undefined}
      {...rest}
    >
      {children}
    </div>
  );
};

export { ScrollArea };
