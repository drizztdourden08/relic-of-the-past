/* @layer shared-input @kind logic */
/**
 * Adapter from SDL's raw per-device capability arrays to the ordered,
 * display-ready control list a screen actually renders. Only positions SDL
 * reported present appear; everything else here is presentation order and
 * label/icon precedence, never a decision about what exists.
 *
 * Display order: face buttons, then d-pad, then shoulders (including grip
 * paddles), then stick clicks, then system buttons, then the sticks
 * themselves, then triggers. Category is derived from the position below,
 * never from a family's configuration.
 */

import { SDL_AXIS, SDL_BUTTON } from '../sdl-buttons';
import {
  buildDisplayContext,
  resolveAxisIcon,
  resolveAxisLabel,
  resolveButtonIcon,
  resolveButtonLabelSpecific,
  resolveTriggerPressThreshold,
} from './resolve-display';
import type { DeviceOverride, ResolvedControl, ResolvedControlCategory, SdlAxisName, SdlButtonName, SdlGamepadType } from './family.type';

/** Full positional index table. The first sixteen reuse the existing named
 *  constants; SDL's remaining button positions have no entry there yet, so
 *  they are named here once rather than left as bare indices at every call
 *  site. */
const BUTTON_INDEX: Record<SdlButtonName, number> = {
  ...SDL_BUTTON,
  RIGHT_PADDLE1: 16,
  LEFT_PADDLE1: 17,
  RIGHT_PADDLE2: 18,
  LEFT_PADDLE2: 19,
  TOUCHPAD: 20,
  MISC2: 21,
  MISC3: 22,
  MISC4: 23,
  MISC5: 24,
  MISC6: 25,
};

const AXIS_INDEX: Record<SdlAxisName, number> = SDL_AXIS;

interface OrderedPosition<T extends string> {
  readonly position: T;
  readonly category: ResolvedControlCategory;
}

const BUTTON_ORDER: readonly OrderedPosition<SdlButtonName>[] = [
  { position: 'SOUTH', category: 'face' },
  { position: 'EAST', category: 'face' },
  { position: 'WEST', category: 'face' },
  { position: 'NORTH', category: 'face' },
  { position: 'DPAD_UP', category: 'dpad' },
  { position: 'DPAD_DOWN', category: 'dpad' },
  { position: 'DPAD_LEFT', category: 'dpad' },
  { position: 'DPAD_RIGHT', category: 'dpad' },
  { position: 'LEFT_SHOULDER', category: 'shoulder' },
  { position: 'RIGHT_SHOULDER', category: 'shoulder' },
  { position: 'LEFT_PADDLE1', category: 'shoulder' },
  { position: 'LEFT_PADDLE2', category: 'shoulder' },
  { position: 'RIGHT_PADDLE1', category: 'shoulder' },
  { position: 'RIGHT_PADDLE2', category: 'shoulder' },
  { position: 'LEFT_STICK', category: 'stick' },
  { position: 'RIGHT_STICK', category: 'stick' },
  { position: 'BACK', category: 'system' },
  { position: 'GUIDE', category: 'system' },
  { position: 'START', category: 'system' },
  { position: 'MISC1', category: 'system' },
  { position: 'MISC2', category: 'system' },
  { position: 'MISC3', category: 'system' },
  { position: 'MISC4', category: 'system' },
  { position: 'MISC5', category: 'system' },
  { position: 'MISC6', category: 'system' },
  { position: 'TOUCHPAD', category: 'system' },
];

const AXIS_ORDER: readonly OrderedPosition<SdlAxisName>[] = [
  { position: 'LEFT_X', category: 'stick' },
  { position: 'LEFT_Y', category: 'stick' },
  { position: 'RIGHT_X', category: 'stick' },
  { position: 'RIGHT_Y', category: 'stick' },
  { position: 'LEFT_TRIGGER', category: 'trigger' },
  { position: 'RIGHT_TRIGGER', category: 'trigger' },
];

interface SdlDeviceCapabilities {
  readonly sdlType: SdlGamepadType;
  readonly vendorId?: string;
  readonly productId?: string;
  /** Indexed by the SDL button enum, same order as SDL reports it. */
  readonly hasButton: readonly boolean[];
  /** Indexed by the SDL axis enum, length 6. */
  readonly hasAxis: readonly boolean[];
  /** SDL's own per-button label, same index space as hasButton. */
  readonly buttonLabels: readonly string[];
  readonly overrides?: readonly DeviceOverride[];
}

/**
 * Builds the ordered, display-ready control list for one device.
 *
 * Label precedence for a button is deliberately not a flat chain: an
 * override or the device's own family renames it first; failing that, SDL's
 * own live per-device label (real hardware, e.g. "A") wins next; only once
 * neither has an answer does generic's plain-English filler apply, so a
 * recognized Xbox or Switch pad still shows what SDL actually printed on the
 * button instead of generic's fallback text once generic covers every
 * position. The positional name itself is the last resort, which never
 * triggers once generic is complete for every position (see
 * generic.family.ts). Icon has no competing live source, so it stays a
 * flat override/family/generic chain, falling back to an empty string only
 * in the same true worst case.
 */
const resolveDeviceControls = (capabilities: SdlDeviceCapabilities): ResolvedControl[] => {
  const { sdlType, vendorId, productId, hasButton, hasAxis, buttonLabels, overrides } = capabilities;
  const ctx = buildDisplayContext({ sdlType, vendorId, productId, overrides });
  const controls: ResolvedControl[] = [];

  for (const entry of BUTTON_ORDER) {
    const index = BUTTON_INDEX[entry.position];
    if (!hasButton[index]) continue;
    const sdlLabel = buttonLabels[index] || undefined;
    const genericLabel = ctx.generic.buttonLabels?.[entry.position];
    controls.push({
      position: entry.position,
      kind: 'button',
      label: resolveButtonLabelSpecific(ctx, entry.position) ?? sdlLabel ?? genericLabel ?? entry.position,
      icon: resolveButtonIcon(ctx, entry.position) ?? '',
      category: entry.category,
    });
  }

  for (const entry of AXIS_ORDER) {
    const index = AXIS_INDEX[entry.position];
    if (!hasAxis[index]) continue;
    controls.push({
      position: entry.position,
      kind: 'axis',
      label: resolveAxisLabel(ctx, entry.position) ?? entry.position,
      icon: resolveAxisIcon(ctx, entry.position) ?? '',
      category: entry.category,
      // Only a trigger axis is ever read as "pressed" like a button; a stick
      // axis has no such reading, so it carries no threshold at all.
      ...(entry.category === 'trigger' ? { pressThreshold: resolveTriggerPressThreshold(ctx) } : {}),
    });
  }

  return controls;
};

export { BUTTON_INDEX, resolveDeviceControls };
export type { SdlDeviceCapabilities };
