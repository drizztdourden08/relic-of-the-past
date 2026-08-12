/* @layer shared-input @kind barrel */
/**
 * Public API for the input data layer. Device identity, capability and
 * display metadata all come from SDL3 plus the family layer now (see
 * shared/input/family); this barrel only still carries the keyboard's own
 * default mapping (SDL never enumerates a keyboard), the DeviceProfile view
 * the calibration wizard and saved-binding icon lookups build from a live or
 * remembered SDL type, and haptics.
 */

export { KEYBOARD_DEFAULT } from './keyboard-default';
export { buildConsoleDefaultMappings } from './build-console-defaults';
export {
  buildDeviceProfile,
  buildDeviceProfileFromResolved,
  buildDeviceProfileFromSdlType,
} from './device-profile';
export type { DeviceProfile, DeviceProfileAxis, DeviceProfileButton, DeviceProfileIdentity } from './device-profile';
export * from './haptics';
