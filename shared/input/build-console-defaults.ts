/* @layer shared-input @kind logic */
/**
 * Builds a device's default SNES button mappings from the family layer's consoleDefaults, the
 * drag-and-drop "apply this device" flow's only source of defaults. Only an sdlType is known,
 * never a live device, so every position the family has a default for gets a binding whether
 * the physical unit has it or not (same tradeoff as buildDeviceProfileFromSdlType).
 *
 * MOVEMENT COMES OUT ON BOTH THE LEFT STICK AND THE D-PAD, and the stick is
 * listed first. One SNES button may carry more than one ButtonMapping: the
 * renderer files a button binding under its index and an axis binding under
 * "axisIndex:direction" (input-manager-events.rebuildMaps), in two separate
 * maps, and computeBitmask ORs every hit into the frame's mask. Nothing keys
 * a map BY snesButton, so two entries naming the same one never collide:
 * they both press it. That is what every emulator does with a pad and what a
 * player expects, so the default takes it and does not make the player choose.
 *
 * Order matters for one thing only, and it is cosmetic: the controls screen
 * shows one row per SNES button and picks the FIRST mapping that names it
 * (useDisplayMappings). Emitting the stick first is what makes that row read
 * "Left Stick Y -" and not "D-Pad Up": the stick is the default now, so the
 * stick is what the row should say.
 */
// Import from the family barrel (./family), never the deep resolve-display/sdl-capabilities
// modules; see device-profile.ts (family self-registration).
import { BUTTON_INDEX, buildDisplayContext, resolveAxisConsoleDefault, resolveAxisLabel, resolveButtonIcon, resolveButtonLabel, resolveConsoleDefault } from './family';
import type { DisplayContext, SdlAxisName, SdlButtonName, SdlGamepadType } from './family';
import { SDL_AXIS } from './sdl-buttons';
import type { ButtonMapping } from '../types/controls';

const AXIS_DIRECTIONS = ['-', '+'] as const;

/** Every axis the family layer can answer a console default for. Only the
 *  left stick carries one today; the loop asks about all of them so a family
 *  or device override can add another without touching this file. */
const AXIS_POSITIONS = Object.keys(SDL_AXIS) as SdlAxisName[];

const axisMappings = (ctx: DisplayContext): ButtonMapping[] => {
  const mappings: ButtonMapping[] = [];

  for (const position of AXIS_POSITIONS) {
    const defaults = resolveAxisConsoleDefault(ctx, position);
    if (!defaults) continue;
    const axisLabel = resolveAxisLabel(ctx, position) ?? position;
    for (const direction of AXIS_DIRECTIONS) {
      const snesButton = defaults[direction];
      if (!snesButton) continue;
      // The axis' own label names the whole axis, so its two ends would read
      // identically without the sign. Same "<label> <sign>" shape the
      // saved-binding icon lookup already produces (resolveIconByVidPid).
      const label = `${axisLabel} ${direction === '+' ? '+' : '−'}`;
      mappings.push({
        snesButton,
        binding: { type: 'gamepad-axis', axisIndex: SDL_AXIS[position], direction, label },
        // NO STORED ICON, and that is the whole point. A family declares ONE
        // base key per stick, shared by its X and its Y (see the axisIcons
        // note in nintendo.family.ts), so a baked key can only ever be the
        // neutral pose, so four movement rows drawing the same undeflected
        // stick say nothing about which end of it each one is. Left null, the
        // controls screen re-resolves the glyph from the binding's own axis
        // and direction at render time (resolveIconByVidPid ->
        // resolveStickDirectionIcon) and gets the four pushed glyphs the art
        // actually ships. A binding with no source device at all still lands
        // on directional generic art, one step further down the same chain
        // (binding-display.ts's AXIS_FALLBACK).
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
      // The label rides on the BINDING, the same way the axis half above does
      // it and the same way a derived slot does (derive-slots.bindingFor). A
      // binding that cannot say what it is bound to falls back to "Button 3",
      // which is not a name anything is printed with.
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
