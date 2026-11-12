/* @layer renderer-app @kind hook */
import { useLayoutEffect, useState } from 'react';
import type { RefObject } from 'react';
import type { ScreenBox } from '@rotp/input-mapping';

const EMPTY_BOX: ScreenBox = { width: 0, height: 0 };

/** The element's size in CSS px, as a new object only when the size changes. */
const useOverlayBox = (ref: RefObject<HTMLElement | null>): ScreenBox => {
  const [box, setBox] = useState<ScreenBox>(EMPTY_BOX);

  useLayoutEffect(() => {
    const element = ref.current;
    if (!element) return undefined;
    const measure = (): void => {
      const width = element.clientWidth;
      const height = element.clientHeight;
      setBox((prev) => (prev.width === width && prev.height === height ? prev : { width, height }));
    };
    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(element);
    return () => observer.disconnect();
  }, [ref]);

  return box;
};

export { useOverlayBox };
