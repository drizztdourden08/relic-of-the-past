/* @layer renderer-components @kind hook */
/** The stage element's size, kept current by a ResizeObserver; null until first measured. */
import { useEffect, useState } from 'react';
import type { RefObject } from 'react';

interface StageSize {
  width: number;
  height: number;
}

const useStageSize = (ref: RefObject<HTMLElement | null>): StageSize | null => {
  const [size, setSize] = useState<StageSize | null>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const read = (): void => {
      const { width, height } = el.getBoundingClientRect();
      setSize((prev) => (prev && prev.width === width && prev.height === height ? prev : { width, height }));
    };
    read();
    const observer = new ResizeObserver(read);
    observer.observe(el);
    return () => observer.disconnect();
  }, [ref]);

  return size;
};

export { useStageSize };
export type { StageSize };
