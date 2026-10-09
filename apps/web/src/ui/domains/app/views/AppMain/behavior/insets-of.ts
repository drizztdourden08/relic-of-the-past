/* @layer renderer-app @kind logic */
import type { ExclusiveInsets } from '@app/stores/exclusive-insets-store';
import { DOCK_STAGE_GAP, NO_INSETS } from './insets-of.constants';

const edge = (room: number): number => (room <= DOCK_STAGE_GAP + 1 ? 0 : room);

const insetsOf = (
  rect: { x: number; y: number; width: number; height: number } | null,
  width: number,
  height: number,
): ExclusiveInsets => {
  if (!rect) return NO_INSETS;
  return {
    left: edge(rect.x),
    top: edge(rect.y),
    right: edge(width - rect.x - rect.width),
    bottom: edge(height - rect.y - rect.height),
  };
};

export { insetsOf };
