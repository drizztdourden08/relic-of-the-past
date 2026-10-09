/* @layer shared-input @kind barrel */
export { KEYBOARD_DEFAULT } from './keyboard-default';
export { buildConsoleDefaultMappings } from './build-console-defaults';
export {
  buildDeviceProfile,
  buildDeviceProfileFromResolved,
  buildDeviceProfileFromSdlType,
} from './device-profile';
export type { DeviceProfile, DeviceProfileAxis, DeviceProfileButton, DeviceProfileIdentity } from './device-profile';
export * from './haptics';
