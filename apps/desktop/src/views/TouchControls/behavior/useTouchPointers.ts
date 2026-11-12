/* @layer renderer-app @kind hook */
import { useCallback, useEffect, useRef, useState } from 'react';
import type { PointerEvent } from 'react';
import type { OrientationLayout } from '@rotp/features';
import { clearTouchPad } from '@app/input/touch-pad/clear-touch-pad';
import { publishTouchPad } from '@app/input/touch-pad/publish-touch-pad';
import type { PxPoint, ScreenBox } from '@rotp/input-mapping';
import { IDLE_VIEW } from '../TouchControls.constants';
import type { MenuHold, TouchSession, TouchViewState } from '../TouchControls.type';
import { deriveTouchState } from './derive-touch-state';
import { moveSession, startSession } from './pointer-sessions';

interface PointerOptions {
  layout: OrientationLayout;
  box: ScreenBox;
  enabled: boolean;
  hold: MenuHold;
  onPress: () => void;
}

const localPoint = (event: PointerEvent<HTMLElement>): PxPoint => {
  const rect = event.currentTarget.getBoundingClientRect();
  return { x: event.clientX - rect.left, y: event.clientY - rect.top };
};

/** Multi-touch for the overlay: each finger keeps the target it landed on, and the pad is published on every change. */
const useTouchPointers = (options: PointerOptions) => {
  const { layout, box, enabled, hold, onPress } = options;
  const sessions = useRef(new Map<number, TouchSession>());
  const [view, setView] = useState<TouchViewState>(IDLE_VIEW);

  const apply = useCallback(() => {
    const next = deriveTouchState(sessions.current, layout, box);
    setView(next.view);
    publishTouchPad(next.pad);
  }, [layout, box]);

  const { cancel: cancelHold } = hold;
  const reset = useCallback(() => {
    sessions.current.clear();
    cancelHold();
    setView(IDLE_VIEW);
    clearTouchPad();
  }, [cancelHold]);

  useEffect(() => {
    reset();
    return clearTouchPad;
  }, [layout, box, enabled, reset]);

  useEffect(() => {
    const onHidden = (): void => { if (document.visibilityState === 'hidden') reset(); };
    window.addEventListener('blur', reset);
    document.addEventListener('visibilitychange', onHidden);
    return () => {
      window.removeEventListener('blur', reset);
      document.removeEventListener('visibilitychange', onHidden);
    };
  }, [reset]);

  const onPointerDown = (event: PointerEvent<HTMLElement>): void => {
    if (!enabled) return;
    event.currentTarget.setPointerCapture(event.pointerId);
    const point = localPoint(event);
    const movementTaken = [...sessions.current.values()].some((s) => s.kind === 'movement');
    const session = startSession(point, layout, box, movementTaken);
    sessions.current.set(event.pointerId, session);
    if (session.kind === 'button') onPress();
    if (session.kind === 'empty') hold.begin(event.pointerId, point);
    apply();
  };

  const onPointerMove = (event: PointerEvent<HTMLElement>): void => {
    const session = sessions.current.get(event.pointerId);
    if (!session) return;
    const point = localPoint(event);
    if (moveSession(session, point, layout, box)) onPress();
    if (session.kind === 'empty') hold.move(event.pointerId, point);
    else apply();
  };

  const onPointerUp = (event: PointerEvent<HTMLElement>): void => {
    if (!sessions.current.delete(event.pointerId)) return;
    hold.end(event.pointerId);
    apply();
  };

  return { view, handlers: { onPointerDown, onPointerMove, onPointerUp, onPointerCancel: reset } };
};

export { useTouchPointers };
