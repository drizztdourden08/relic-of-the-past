/* @layer renderer-components @kind hook */
import { useLayoutEffect, useState } from 'react';

const useControlsNarrow = (): boolean => {
  const [narrow, setNarrow] = useState(false);
  useLayoutEffect(() => {
    const root = document.querySelector<HTMLElement>('.controls-settings');
    if (!root) return;
    const observer = new ResizeObserver(([entry]) => {
      if (entry) setNarrow(entry.contentRect.width < 640);
    });
    observer.observe(root);
    return () => observer.disconnect();
  }, []);
  return narrow;
};

export { useControlsNarrow };
