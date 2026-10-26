/* @layer shared-input @kind barrel */
export type { AssignedDevice, DetectedDevice, DevicePreset, InputProfile } from '../../controls/devices/devices.type';
export { detectAllDevices } from '../../runtime/device-detector/detect-all-devices';
export { deviceKeyFor } from '../../runtime/device-scoped-map/device-key-for';
export { ANY_DEVICE } from '../../runtime/device-scoped-map/device-scoped-map.constants';
export type { DeviceScopedMap } from '../../runtime/device-scoped-map/device-scoped-map.type';
export { setScoped } from '../../runtime/device-scoped-map/set-scoped';
export { allowedDevices } from '../../runtime/profile-devices/allowed-devices';
export { padHex } from '../../runtime/profile-devices/pad-hex';
export type { AllowedDevices } from '../../runtime/profile-devices/profile-devices.type';
export { profileFromPreset } from '../../runtime/profile-utils/profile-from-preset';
export { resolveFunctionMappingIcon } from '../../runtime/profile-utils/resolve-function-mapping-icon';
export { resolveIconByVidPid } from '../../runtime/profile-utils/resolve-icon-by-vid-pid';
