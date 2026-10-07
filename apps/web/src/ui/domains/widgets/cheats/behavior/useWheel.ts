/* @layer renderer-widgets @kind hook */
/**
 * A non-passive wheel listener on whichever element the returned ref lands on. The ref is a
 * callback, so an element that mounts after the first render (a control that becomes editable
 * later) still gets the listener. The handler is read through a ref, so a new closure on every
 * render never re-subscribes.
 */
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
