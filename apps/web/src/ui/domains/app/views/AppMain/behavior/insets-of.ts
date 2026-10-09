/* @layer renderer-app @kind logic */
import type { ExclusiveInsets } from '@app/stores/exclusive-insets-store';
import { NO_INSETS } from './insets-of.constants';

const insetsOf = (
  rect: { x: number; y: number; width: number; height: number } | null,
  width: number,
  height: number,
): ExclusiveInsets => {
  if (!rect) return NO_INSETS;
  return {
    left: Math.max(0, rect.x),
    top: Math.max(0, rect.y),
    right: Math.max(0, width - rect.x - rect.width),
    bottom: Math.max(0, height - rect.y - rect.height),
  };
};

export { insetsOf };
