/* @layer renderer-app @kind logic */
import type { PointerEvent } from 'react';
import type { PxPoint } from '@rotp/input-mapping';
import { localPoint } from './local-point';

const sessionAt = <S>(
  sessions: ReadonlyMap<number, S>,
  event: PointerEvent<HTMLElement>,
): { session: S; point: PxPoint } | null => {
  const session = sessions.get(event.pointerId);
  return session === undefined ? null : { session, point: localPoint(event) };
};

export { sessionAt };
