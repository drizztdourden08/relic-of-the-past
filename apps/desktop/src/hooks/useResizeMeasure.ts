/* @layer renderer-other @kind hook */
import { useEffect, useRef } from 'react';

const useResizeMeasure = (measure: (el: HTMLDivElement) => void) => {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const run = () => measure(el);
    run();
    const observer = new ResizeObserver(run);
    observer.observe(el);
    return () => observer.disconnect();
  }, [measure]);

  return containerRef;
};

export { useResizeMeasure };
