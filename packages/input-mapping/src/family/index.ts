/* @layer shared-input @kind barrel */
export {
  buildDisplayContext,
  resolveAxisConsoleDefault,
  resolveAxisLabel,
  resolveBrandLogoKey,
  resolveButtonIcon,
  resolveButtonLabel,
  resolveConsoleDefault,
  resolveDeviceName,
  resolveTriggerPressThreshold,
} from './resolve-display';
export type { DisplayContext } from './resolve-display';
export { applyVibrationShaping } from './vibration-shaping';
export { resolveDeviceControls } from './sdl-capabilities';
export { BUTTON_INDEX } from './sdl-capabilities.constants';
export { resolveStickDirectionIcon } from './stick-direction-icon';
export { GAMECUBE_FAMILY } from './gamecube-family';
export { GENERIC_FAMILY } from './generic-family';
export { NINTENDO_FAMILY } from './nintendo-family';
export { PLAYSTATION_FAMILY } from './playstation-family';
export { XBOX_FAMILY } from './xbox-family';
export type {
  FamilyMetadata,
  ResolvedControl,
  ResolvedDevice,
  SdlAxisName,
  SdlButtonName,
  SdlGamepadType,
} from './family.type';
