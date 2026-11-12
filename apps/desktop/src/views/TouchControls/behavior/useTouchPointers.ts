/* @layer renderer-app @kind hook */
import { useCallback, useEffect, useRef, useState } from 'react';
import type { PointerEvent } from 'react';
import { clearTouchPad } from '@app/input/touch-pad/clear-touch-pad';
import { publishTouchPad } from '@app/input/touch-pad/publish-touch-pad';
import { IDLE_VIEW } from '../TouchControls.constants';
import type { TouchSession, TouchViewState } from '../TouchControls.type';
import { deriveTouchState } from './derive-touch-state';
import { localPoint } from './local-point';
import { moveSession } from './move-session';
import { sessionAt } from './session-at';
import { startSession } from './start-session';
import type { PointerOptions } from './useTouchPointers.type';

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
    const hit = sessionAt(sessions.current, event);
    if (!hit) return;
    const { session, point } = hit;
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
