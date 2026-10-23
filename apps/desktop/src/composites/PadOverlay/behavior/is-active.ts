/* @layer renderer-components @kind logic */
import { STICK_ACTIVE_DEFLECTION } from '../PadOverlay.constants';
import type { OverlayPartKind, PartState } from '../PadOverlay.type';

const isActive = (kind: OverlayPartKind, state: PartState | undefined): boolean => {
  if (!state) return false;
  if (kind === 'dpad') return Object.values(state.dpad ?? {}).some(Boolean);
  if (kind === 'analog') return (state.value ?? 0) > 0;
  if (kind === 'stick') return Boolean(state.pressed) || Math.hypot(state.x ?? 0, state.y ?? 0) >= STICK_ACTIVE_DEFLECTION;
  return Boolean(state.pressed);
};

export { isActive };
