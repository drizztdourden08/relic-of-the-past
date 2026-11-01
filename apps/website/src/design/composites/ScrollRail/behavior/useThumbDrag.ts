/* @layer website-site @kind hook */
import type { KeyboardEvent, PointerEvent, RefObject } from 'react';
import { KEY_STEPS } from '../ScrollRail.constants';
import type { RailGeometry } from '../ScrollRail.type';
import { railProgressOf } from './rail-progress-of';
import { scrollOfProgress } from './scroll-of-progress';

const scrollToProgress = (geometry: RailGeometry, progress: number): void => {
  const clamped = Math.min(Math.max(progress, 0), 1);
  window.scrollTo({ top: scrollOfProgress(geometry, clamped, window.innerHeight), behavior: 'instant' });
};

const useThumbDrag = (geometry: RailGeometry, trackRef: RefObject<HTMLElement | null>) => {
  const dragTo = (event: PointerEvent<HTMLElement>): void => {
    const track = trackRef.current?.getBoundingClientRect();
    if (!track || track.height === 0) return;
    scrollToProgress(geometry, (event.clientY - track.top) / track.height);
  };

  return {
    onPointerDown: (event: PointerEvent<HTMLElement>): void => {
      event.currentTarget.setPointerCapture(event.pointerId);
      dragTo(event);
    },
    onPointerMove: (event: PointerEvent<HTMLElement>): void => {
      if (event.currentTarget.hasPointerCapture(event.pointerId)) dragTo(event);
    },
    onKeyDown: (event: KeyboardEvent<HTMLElement>): void => {
      const step = KEY_STEPS[event.key] ?? 0;
      if (step === 0) return;
      event.preventDefault();
      scrollToProgress(geometry, railProgressOf(geometry, window.scrollY, window.innerHeight) + step);
    },
  };
};

export { useThumbDrag };
