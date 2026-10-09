/* @layer shared-input @kind logic */
import { BUTTON_INDEX, buildDisplayContext, resolveAxisConsoleDefault, resolveAxisLabel, resolveButtonIcon, resolveButtonLabel, resolveConsoleDefault } from './family';
import type { DisplayContext, SdlButtonName, SdlGamepadType } from './family';
import { SDL_AXIS } from './sdl-buttons';
import { axisEndLabel } from './axis-end-label';
import { AXIS_DIRECTIONS, AXIS_POSITIONS } from './build-console-defaults.constants';
import type { ButtonMapping } from '../types/controls';

const axisMappings = (ctx: DisplayContext): ButtonMapping[] => {
  const mappings: ButtonMapping[] = [];

  for (const position of AXIS_POSITIONS) {
    const defaults = resolveAxisConsoleDefault(ctx, position);
    if (!defaults) continue;
    const axisLabel = resolveAxisLabel(ctx, position) ?? position;
    for (const direction of AXIS_DIRECTIONS) {
      const snesButton = defaults[direction];
      if (!snesButton) continue;
      const label = axisEndLabel(axisLabel, direction);
      mappings.push({
        snesButton,
        binding: { type: 'gamepad-axis', axisIndex: SDL_AXIS[position], direction, label },
        icon: null,
      });
    }
  }

  return mappings;
};

const buttonMappings = (ctx: DisplayContext): ButtonMapping[] => {
  const mappings: ButtonMapping[] = [];

  for (const position of Object.keys(BUTTON_INDEX) as SdlButtonName[]) {
    const snesButton = resolveConsoleDefault(ctx, position);
    if (!snesButton) continue;
    const iconKey = resolveButtonIcon(ctx, position);
    const label = resolveButtonLabel(ctx, position) ?? position;
    mappings.push({
      snesButton,
      binding: { type: 'gamepad-button', index: BUTTON_INDEX[position], label },
      icon: iconKey ? { key: iconKey, path: null, label } : null,
    });
  }

  return mappings;
};

const buildConsoleDefaultMappings = (params: { sdlType: SdlGamepadType; vendorId?: string; productId?: string }): ButtonMapping[] => {
  const { sdlType, vendorId, productId } = params;
  const ctx = buildDisplayContext({ sdlType, vendorId, productId });
  return [...axisMappings(ctx), ...buttonMappings(ctx)];
};

export { buildConsoleDefaultMappings };
