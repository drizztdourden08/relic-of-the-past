/* @layer renderer-components @kind logic */
/**
 * Builds the fixed, ordered list of inputs the positional-capture step asks
 * about: every control the connected device's ResolvedDevice carries (see
 * resolve-device.ts), in the same face/d-pad/shoulder/stick/system/axis
 * order the calibration cards render. SDL's own capability report decides
 * this list, never a preset's defaultMappings; a control missing from a
 * preset used to mean the diagnostic never asked about it at all, which is
 * exactly the gap this closes. Pure and independent of any live sample;
 * usePositionalOneByOne only reads live state to detect which one fired.
 */
import { SDL_BUTTON } from '@shared/input/sdl-buttons';
import type { ResolvedDevice, SdlButtonName } from '@shared/input/family';
import type { PositionalTarget } from './positional-capture.type';

const buildPositionalTargets = (resolvedDevice: ResolvedDevice | null): PositionalTarget[] => {
  if (!resolvedDevice) return [];

  return resolvedDevice.controls.map((control) => ({
    id: control.position,
    kind: control.kind,
    label: control.label,
    category: control.category,
    // The button position IS the expectation: a joystick-level press landing
    // anywhere else means the raw index disagrees with what SDL itself
    // reports at that name. An axis has no comparable single index to check.
    expectedIndex: control.kind === 'button' ? SDL_BUTTON[control.position as SdlButtonName] : null,
  }));
};

export { buildPositionalTargets };
