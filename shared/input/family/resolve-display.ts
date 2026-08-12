/* @layer shared-input @kind logic */
/**
 * Chain of responsibility over device override, family and generic display
 * metadata. Every lookup below walks that exact order and returns the
 * first defined answer for one field, so a family can rename two buttons
 * and inherit everything else from generic, and a device override can
 * narrow further on top of its family without repeating what it agrees
 * with.
 */

import { findFamily } from './family-registry';
import { GENERIC_FAMILY } from './generic.family';
import { DEFAULT_TRIGGER_PRESS_THRESHOLD } from './live-control-state';
import type {
  ConsoleButton,
  DeviceOverride,
  FamilyMetadata,
  SdlAxisName,
  SdlButtonName,
  SdlGamepadType,
} from './family.type';

interface DisplayContext {
  readonly override: DeviceOverride | null;
  readonly family: FamilyMetadata;
  readonly generic: FamilyMetadata;
}

const findOverride = (
  overrides: readonly DeviceOverride[],
  vendorId: string | undefined,
  productId: string | undefined,
): DeviceOverride | null => {
  if (!vendorId || !productId) return null;
  return overrides.find(entry => entry.vendorId === vendorId && entry.productId === productId) ?? null;
};

const buildDisplayContext = (params: {
  sdlType: SdlGamepadType;
  vendorId?: string;
  productId?: string;
  overrides?: readonly DeviceOverride[];
}): DisplayContext => {
  const { sdlType, vendorId, productId, overrides = [] } = params;
  return {
    override: findOverride(overrides, vendorId, productId),
    family: findFamily(sdlType),
    generic: GENERIC_FAMILY,
  };
};

const resolveBrandLogoKey = (ctx: DisplayContext): string => {
  return ctx.override?.brandLogoKey ?? ctx.family.brandLogoKey ?? ctx.generic.brandLogoKey ?? '';
};

const resolveDeviceName = (ctx: DisplayContext, sdlName: string): string => {
  const rename = ctx.override?.deviceName ?? ctx.family.deviceName ?? ctx.generic.deviceName;
  return rename ? rename(sdlName) : sdlName;
};

const resolveButtonLabel = (ctx: DisplayContext, position: SdlButtonName): string | undefined => {
  return ctx.override?.buttonLabels?.[position] ?? ctx.family.buttonLabels?.[position] ?? ctx.generic.buttonLabels?.[position];
};

/**
 * Override and family only, generic excluded. A button label is the one
 * field with a competing live source (SDL's own per-device label), which
 * must be allowed to win over generic's plain-English filler text once
 * generic answers for every position; it must never be allowed to win over
 * a specific family's own override, so this exists to let a caller slot
 * that live label in at exactly that point in the chain. See
 * sdl-capabilities.ts for the full order this feeds into.
 */
const resolveButtonLabelSpecific = (ctx: DisplayContext, position: SdlButtonName): string | undefined => {
  return ctx.override?.buttonLabels?.[position] ?? ctx.family.buttonLabels?.[position];
};

const resolveButtonIcon = (ctx: DisplayContext, position: SdlButtonName): string | undefined => {
  return ctx.override?.buttonIcons?.[position] ?? ctx.family.buttonIcons?.[position] ?? ctx.generic.buttonIcons?.[position];
};

const resolveAxisLabel = (ctx: DisplayContext, position: SdlAxisName): string | undefined => {
  return ctx.override?.axisLabels?.[position] ?? ctx.family.axisLabels?.[position] ?? ctx.generic.axisLabels?.[position];
};

const resolveAxisIcon = (ctx: DisplayContext, position: SdlAxisName): string | undefined => {
  return ctx.override?.axisIcons?.[position] ?? ctx.family.axisIcons?.[position] ?? ctx.generic.axisIcons?.[position];
};

/** Console-screen preset default only; never consumed by detection,
 *  calibration, or the diagnostic (see FamilyMetadata.consoleDefaults). */
const resolveConsoleDefault = (ctx: DisplayContext, position: SdlButtonName): ConsoleButton | undefined => {
  return ctx.override?.consoleDefaults?.[position] ?? ctx.family.consoleDefaults?.[position] ?? ctx.generic.consoleDefaults?.[position];
};

/** How far a trigger axis must travel before it also counts as pressed;
 *  see FamilyMetadata.triggerPressThreshold. */
const resolveTriggerPressThreshold = (ctx: DisplayContext): number => {
  return ctx.override?.triggerPressThreshold
    ?? ctx.family.triggerPressThreshold
    ?? ctx.generic.triggerPressThreshold
    ?? DEFAULT_TRIGGER_PRESS_THRESHOLD;
};

/** Per-family rumble strength curve; see FamilyMetadata.shapeVibration.
 *  Identity when neither an override nor the family sets one. */
const resolveShapeVibration = (ctx: DisplayContext): ((intensity: number) => number) => {
  return ctx.override?.shapeVibration ?? ctx.family.shapeVibration ?? ctx.generic.shapeVibration ?? ((intensity) => intensity);
};

/** Minimum vibration duration (ms) this family's motor needs to spin up and
 *  actually register; see FamilyMetadata.minDurationMs. 0 (default) is no floor. */
const resolveMinDurationMs = (ctx: DisplayContext): number => {
  return ctx.override?.minDurationMs ?? ctx.family.minDurationMs ?? ctx.generic.minDurationMs ?? 0;
};

export {
  buildDisplayContext,
  resolveAxisIcon,
  resolveAxisLabel,
  resolveBrandLogoKey,
  resolveButtonIcon,
  resolveButtonLabel,
  resolveButtonLabelSpecific,
  resolveConsoleDefault,
  resolveDeviceName,
  resolveMinDurationMs,
  resolveShapeVibration,
  resolveTriggerPressThreshold,
};
export type { DisplayContext };
