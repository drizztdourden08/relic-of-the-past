/* @layer renderer-widgets @kind hook */
import { useCallback, useEffect, useRef, useState } from 'react';

const useWheel = <T extends HTMLElement>(onStep: (dir: 1 | -1) => void) => {
  const [host, setHost] = useState<T | null>(null);
  const handler = useRef(onStep);
  handler.current = onStep;

  useEffect(() => {
    if (!host) return;
    const onWheel = (e: WheelEvent) => {
      e.preventDefault();
      handler.current(e.deltaY < 0 ? 1 : -1);
    };
    host.addEventListener('wheel', onWheel, { passive: false });
    return () => host.removeEventListener('wheel', onWheel);
  }, [host]);

  const ref = useCallback((el: T | null) => setHost(el), []);
  return ref;
};

export { useWheel };
