/* @layer shared-input @kind logic */
/**
 * Builds a device's default SNES button mappings from the family layer's consoleDefaults, the
 * drag-and-drop "apply this device" flow's only source of defaults. Only an sdlType is known,
 * never a live device, so every position the family has a default for gets a binding whether
 * the physical unit has it or not (same tradeoff as buildDeviceProfileFromSdlType).
 */
// Import from the family barrel (./family), never the deep resolve-display/sdl-capabilities
// modules; see device-profile.ts (family self-registration).
import { BUTTON_INDEX, buildDisplayContext, resolveButtonIcon, resolveButtonLabel, resolveConsoleDefault } from './family';
import type { SdlButtonName, SdlGamepadType } from './family';
import type { ButtonMapping } from '../types/controls';

const buildConsoleDefaultMappings = (params: { sdlType: SdlGamepadType; vendorId?: string; productId?: string }): ButtonMapping[] => {
  const { sdlType, vendorId, productId } = params;
  const ctx = buildDisplayContext({ sdlType, vendorId, productId });
  const mappings: ButtonMapping[] = [];

  for (const position of Object.keys(BUTTON_INDEX) as SdlButtonName[]) {
    const snesButton = resolveConsoleDefault(ctx, position);
    if (!snesButton) continue;
    const iconKey = resolveButtonIcon(ctx, position);
    const label = resolveButtonLabel(ctx, position) ?? position;
    mappings.push({
      snesButton,
      binding: { type: 'gamepad-button', index: BUTTON_INDEX[position] },
      icon: iconKey ? { key: iconKey, path: null, label } : null,
    });
  }

  return mappings;
};

export { buildConsoleDefaultMappings };
