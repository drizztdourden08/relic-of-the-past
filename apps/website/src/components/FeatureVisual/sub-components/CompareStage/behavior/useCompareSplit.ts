/* @layer website-site @kind hook */
import { useEffect, useRef } from 'react';
import type { PointerEvent } from 'react';
import { useReducedMotion } from '../../../behavior/useReducedMotion';
import { SPLIT_REST, SPLIT_VAR } from '../CompareStage.constants';
import type { SweepState } from '../CompareStage.type';
import { advanceSweep } from './advance-sweep';
import { splitOfPointer } from './split-of-pointer';

const useCompareSplit = (axis: 'x' | 'y') => {
  const stageRef = useRef<HTMLElement>(null);
  const state = useRef<SweepState>({ pos: SPLIT_REST, dir: 1 });
  const hovering = useRef(false);
  const visible = useRef(false);
  const reduced = useReducedMotion();

  const paint = () => stageRef.current?.style.setProperty(SPLIT_VAR, `${state.current.pos}%`);

  useEffect(() => {
    const stage = stageRef.current;
    if (!stage) return undefined;
    const observer = new IntersectionObserver(([entry]) => {
      visible.current = entry?.isIntersecting ?? false;
    });
    observer.observe(stage);
    let last = performance.now();
    let frame = 0;
    const tick = (now: number) => {
      const elapsed = now - last;
      last = now;
      if (!reduced && !hovering.current && visible.current) {
        state.current = advanceSweep(state.current, elapsed);
        paint();
      }
      frame = requestAnimationFrame(tick);
    };
    paint();
    frame = requestAnimationFrame(tick);
    return () => {
      cancelAnimationFrame(frame);
      observer.disconnect();
    };
  }, [reduced]);

  const follow = (event: PointerEvent<HTMLElement>) => {
    hovering.current = true;
    state.current = { ...state.current, pos: splitOfPointer(event, axis) };
    paint();
  };

  const release = () => {
    hovering.current = false;
  };

  return { stageRef, handlers: { onPointerMove: follow, onPointerDown: follow, onPointerLeave: release, onPointerCancel: release } };
};

export { useCompareSplit };
