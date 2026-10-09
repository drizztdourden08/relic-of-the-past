/* @layer shared-platform @kind barrel */
export { detectHost } from './detect-host';
export { osFromProcess } from './os-from-process';
export { isPrimaryModifier } from './is-primary-modifier';
export { primaryModifierLabel } from './primary-modifier-label';
export type { ModifierFlags } from './primary-modifier.type';
export { createPlatform } from './create-platform';
export { resolvePlatform } from './resolve-platform';

export type { HostShell, OsKind, FormFactor, InputModel, PlatformInfo, Capabilities } from './platform-info.type';
export type { WindowControlsPort, Unsub } from './ports/window-controls.type';
export type { DataDomain, DataLocation, DomainUsage, StorageSummary, StoragePort } from './ports/storage.type';
export type { FileStat, FileStore } from './ports/file-store.type';
export type { PickedFile, SaveFileRequest, SaveFileResult, FilePickerPort } from './ports/file-picker.type';
export type {
  ControllerHost, HidDeviceInfo, HidOpenedInfo, HidDisconnectInfo, HidErrorInfo, VibrateStep, VibrateResult,
} from './ports/controller-host.type';
export type { DevicePort } from './ports/device.type';
export type { DisplayPort } from './ports/display.type';
export { UNSUPPORTED_SYNCED_RATE } from './ports/display.constants';
export type { PlatformFactory } from './factory.type';
export type { Platform, FactoryMap } from './platform.type';
