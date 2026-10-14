/* @layer renderer-components @kind hook */
import { useEffect, useRef, useState } from 'react';

const useStageScale = (viewWidth: number) => {
  const stageRef = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(1);

  useEffect(() => {
    const element = stageRef.current;
    if (!element) return;
    const measure = (): void => {
      const width = element.clientWidth;
      if (width > 0) setScale(width / viewWidth);
    };
    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(element);
    return () => observer.disconnect();
  }, [viewWidth]);

  return { stageRef, scale };
};

export { useStageScale };
