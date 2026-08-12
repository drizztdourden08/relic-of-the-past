/* @layer shared-input @kind barrel */
// Registration entry point: importing this file self-registers every family
// before any lookup runs. Order does not matter; each family claims a
// disjoint set of SdlGamepadType values.
import './nintendo.family';
import './xbox.family';
import './playstation.family';
import './gamecube.family';
import './generic.family';

export { findFamily, registerFamily } from './family-registry';
export {
  buildDisplayContext,
  resolveAxisIcon,
  resolveAxisLabel,
  resolveBrandLogoKey,
  resolveButtonIcon,
  resolveButtonLabel,
  resolveConsoleDefault,
  resolveDeviceName,
  resolveMinDurationMs,
  resolveShapeVibration,
  resolveTriggerPressThreshold,
} from './resolve-display';
export type { DisplayContext } from './resolve-display';
export { applyVibrationShaping } from './vibration-shaping';
export { BUTTON_INDEX, resolveDeviceControls } from './sdl-capabilities';
export type { SdlDeviceCapabilities } from './sdl-capabilities';
export { DEFAULT_TRIGGER_PRESS_THRESHOLD, resolveLiveControlState } from './live-control-state';
export type { LiveControlState } from './live-control-state';
export { resolveStickDirectionIcon, STICK_DIRECTION_DEADZONE } from './stick-direction-icon';
export { GAMECUBE_FAMILY } from './gamecube.family';
export { GENERIC_FAMILY } from './generic.family';
export { NINTENDO_FAMILY } from './nintendo.family';
export { PLAYSTATION_FAMILY } from './playstation.family';
export { XBOX_FAMILY } from './xbox.family';
export type {
  ConsoleButton,
  DeviceOverride,
  FamilyMetadata,
  ResolvedControl,
  ResolvedControlCategory,
  ResolvedDevice,
  SdlAxisName,
  SdlButtonName,
  SdlGamepadType,
} from './family.type';
