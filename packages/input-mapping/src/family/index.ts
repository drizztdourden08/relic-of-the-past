/* @layer shared-input @kind barrel */
export { findFamily, registerFamily } from './family-registry';
export {
  buildDisplayContext,
  resolveAxisConsoleDefault,
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
export { resolveDeviceControls } from './sdl-capabilities';
export { BUTTON_INDEX } from './sdl-capabilities.constants';
export type { SdlDeviceCapabilities } from './sdl-capabilities.type';
export { resolveLiveControlState } from './live-control-state';
export { DEFAULT_TRIGGER_PRESS_THRESHOLD } from './live-control-state.constants';
export type { LiveControlState } from './live-control-state.type';
export { resolveStickDirectionIcon } from './stick-direction-icon';
export { STICK_DIRECTION_DEADZONE } from './stick-direction-icon.constants';
export { GAMECUBE_FAMILY } from './gamecube.family';
export { GENERIC_FAMILY } from './generic.family';
export { NINTENDO_FAMILY } from './nintendo.family';
export { PLAYSTATION_FAMILY } from './playstation.family';
export { XBOX_FAMILY } from './xbox.family';
export type {
  AxisConsoleDefault,
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
