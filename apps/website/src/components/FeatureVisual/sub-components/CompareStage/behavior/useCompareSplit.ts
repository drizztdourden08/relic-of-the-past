/* @layer website-site @kind hook */
import { useEffect, useRef } from 'react';
import type { PointerEvent } from 'react';
import { useReducedMotion } from '../../../behavior/useReducedMotion';
import { SPLIT_REST, SPLIT_VAR } from '../CompareStage.constants';
import type { SweepState } from '../CompareStage.type';
import { advanceSweep } from './advance-sweep';
import { posOfSweep } from './pos-of-sweep';
import { splitOfPointer } from './split-of-pointer';
import { sweepAtPos } from './sweep-at-pos';

const useCompareSplit = (axis: 'x' | 'y') => {
  const stageRef = useRef<HTMLElement>(null);
  const state = useRef<SweepState>(sweepAtPos(SPLIT_REST, 1));
  const pos = useRef(SPLIT_REST);
  const hovering = useRef(false);
  const visible = useRef(false);
  const reduced = useReducedMotion();

  const paint = () => stageRef.current?.style.setProperty(SPLIT_VAR, `${pos.current}%`);

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
        pos.current = posOfSweep(state.current);
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
    pos.current = splitOfPointer(event, axis);
    paint();
  };

  const release = () => {
    hovering.current = false;
    state.current = sweepAtPos(pos.current, state.current.dir);
  };

  return { stageRef, handlers: { onPointerMove: follow, onPointerDown: follow, onPointerLeave: release, onPointerCancel: release } };
};

export { useCompareSplit };
