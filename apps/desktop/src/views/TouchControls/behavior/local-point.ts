/* @layer renderer-app @kind logic */
import type { PointerEvent } from 'react';
import type { PxPoint } from '@rotp/input-mapping';

const localPoint = (event: PointerEvent<HTMLElement>): PxPoint => {
  const rect = event.currentTarget.getBoundingClientRect();
  return { x: event.clientX - rect.left, y: event.clientY - rect.top };
};

export { localPoint };
