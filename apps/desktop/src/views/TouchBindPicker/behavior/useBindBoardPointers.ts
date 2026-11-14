/* @layer renderer-app @kind hook */
import { useRef, useState } from 'react';
import type { PointerEvent } from 'react';
import { dragDirection, movementRadiusPx, readDpad, resolveTouchTarget, toPx, touchEmitBinding, touchStickBinding } from '@rotp/input-mapping';
import type { PxPoint } from '@rotp/input-mapping';
import { localPoint } from '@app/views/TouchControls/behavior/local-point';
import { sessionAt } from '@app/views/TouchControls/behavior/session-at';
import { DPAD_DIRECTIONS, STICK_PICK_FRACTION } from './bind-directions.constants';
import type { BindBoardOptions, BindSession, BindStick } from './useBindBoardPointers.type';

const clampKnob = (base: PxPoint, point: PxPoint, radius: number): PxPoint => {
  const dx = point.x - base.x;
  const dy = point.y - base.y;
  const length = Math.hypot(dx, dy);
  const scale = length > radius ? radius / length : 1;
  return { x: base.x + dx * scale, y: base.y + dy * scale };
};

const useBindBoardPointers = (options: BindBoardOptions) => {
  const { layout, box, onPick } = options;
  const sessions = useRef(new Map<number, BindSession>());
  const [stick, setStick] = useState<BindStick | null>(null);
  const radius = movementRadiusPx(layout, box);

  const pickDpad = (point: PxPoint, center: PxPoint): void => {
    const reading = readDpad(point, center, radius);
    const dir = DPAD_DIRECTIONS.find((d) => reading[d]);
    if (dir) onPick(touchEmitBinding(dir));
  };

  const pickStick = (point: PxPoint, base: PxPoint): void => {
    const dir = dragDirection(point.x - base.x, point.y - base.y, radius * STICK_PICK_FRACTION);
    if (dir) onPick(touchStickBinding(dir));
    else setStick({ base, knob: clampKnob(base, point, radius) });
  };

  const onPointerDown = (event: PointerEvent<HTMLElement>): void => {
    event.currentTarget.setPointerCapture(event.pointerId);
    const point = localPoint(event);
    const target = resolveTouchTarget(point, layout, box);
    if (target.kind === 'button') {
      const button = layout.buttons.find((b) => b.id === target.id);
      if (button) onPick(touchEmitBinding(button.emit));
      return;
    }
    if (target.kind !== 'movement') return;
    const { movementType, movements } = layout;
    if (movementType === 'dpad') {
      const center = toPx(movements.dpad.at, box);
      sessions.current.set(event.pointerId, { kind: 'dpad', center });
      pickDpad(point, center);
      return;
    }
    const base = movementType === 'fixed-stick' ? toPx(movements['fixed-stick'].at, box) : point;
    sessions.current.set(event.pointerId, { kind: 'stick', base });
    pickStick(point, base);
  };

  const onPointerMove = (event: PointerEvent<HTMLElement>): void => {
    const hit = sessionAt(sessions.current, event);
    if (!hit) return;
    const { session, point } = hit;
    if (session.kind === 'dpad') pickDpad(point, session.center);
    else pickStick(point, session.base);
  };

  const onPointerUp = (event: PointerEvent<HTMLElement>): void => {
    sessions.current.delete(event.pointerId);
    setStick(null);
  };

  return { stick, handlers: { onPointerDown, onPointerMove, onPointerUp, onPointerCancel: onPointerUp } };
};

export { useBindBoardPointers };
