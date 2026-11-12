/* @layer shared-input @kind logic */
import type { TouchEmit } from '@rotp/features';
import type { InputBinding } from '@rotp/game-data';
import { W3C_TO_SDL_BUTTON } from '../../runtime/touch-pad/touch-pad.constants';
import { emitLabel } from '../editing/emit-label';
import { EMIT_TO_PAD_INDEX } from '../touch-emit.constants';
import { TRIGGER_AXIS_BY_EMIT } from './touch-emit-binding.constants';

const touchEmitBinding = (emit: TouchEmit): InputBinding => {
  const label = `Touch ${emitLabel(emit)}`;
  const axisIndex = TRIGGER_AXIS_BY_EMIT[emit];
  if (axisIndex !== undefined) return { type: 'gamepad-axis', axisIndex, direction: '+', label };
  return { type: 'gamepad-button', index: W3C_TO_SDL_BUTTON[EMIT_TO_PAD_INDEX[emit]] ?? 0, label };
};

export { touchEmitBinding };
