/* @layer website-site @kind hook */
import { useEffect, useRef } from 'react';
import { BAR_HEIGHT_VAR, STUCK_ATTR } from '../ChapterBar.constants';

const useStuckBar = () => {
  const barRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    const bar = barRef.current;
    if (!bar) return undefined;
    const paint = (): void => {
      bar.toggleAttribute(STUCK_ATTR, bar.getBoundingClientRect().top < 1);
    };
    const size = new ResizeObserver(() => {
      document.documentElement.style.setProperty(BAR_HEIGHT_VAR, `${bar.offsetHeight}px`);
      paint();
    });
    paint();
    size.observe(bar);
    window.addEventListener('scroll', paint, { passive: true });
    return () => {
      size.disconnect();
      window.removeEventListener('scroll', paint);
    };
  }, []);

  return barRef;
};

export { useStuckBar };
