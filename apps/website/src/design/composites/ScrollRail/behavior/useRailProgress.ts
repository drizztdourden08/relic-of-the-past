/* @layer website-site @kind hook */
import { useEffect, useRef } from 'react';
import { PAST_ATTR, PROGRESS_VAR, VIEW_ANCHOR } from '../ScrollRail.constants';
import type { RailGeometry } from '../ScrollRail.type';
import { railProgressOf } from './rail-progress-of';

const useRailProgress = (geometry: RailGeometry) => {
  const railRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    const paint = (): void => {
      const progress = railProgressOf(geometry, window.scrollY, window.innerHeight);
      const past = window.scrollY + window.innerHeight * VIEW_ANCHOR > geometry.top + geometry.span;
      railRef.current?.style.setProperty(PROGRESS_VAR, String(progress));
      railRef.current?.toggleAttribute(PAST_ATTR, past);
    };
    paint();
    window.addEventListener('scroll', paint, { passive: true });
    window.addEventListener('resize', paint);
    return () => {
      window.removeEventListener('scroll', paint);
      window.removeEventListener('resize', paint);
    };
  }, [geometry]);

  return railRef;
};

export { useRailProgress };
