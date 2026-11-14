/* @layer renderer-other @kind hook */
import { useEffect, useRef } from 'react';
import { GAME_VIEW_RESIZED_EVENT } from './live-aspect.constants';

const useResizeMeasure = (measure: (el: HTMLDivElement) => void) => {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const run = () => measure(el);
    run();
    const observer = new ResizeObserver(run);
    observer.observe(el);
    window.addEventListener(GAME_VIEW_RESIZED_EVENT, run);
    return () => {
      observer.disconnect();
      window.removeEventListener(GAME_VIEW_RESIZED_EVENT, run);
    };
  }, [measure]);

  return containerRef;
};

export { useResizeMeasure };
