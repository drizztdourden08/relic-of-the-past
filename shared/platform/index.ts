/* @layer shared-platform @kind barrel */
export { detectHost, osFromProcess } from './detect';
export { createPlatform, resolvePlatform } from './platform';

export type { HostShell, OsKind, FormFactor, InputModel, PlatformInfo, Capabilities } from './types';
export type { WindowControlsPort, Unsub } from './ports/window-controls';
export type { DataDomain, DataLocation, DomainUsage, StorageSummary, StoragePort } from './ports/storage';
export type { FileStat, FileStore } from './ports/file-store';
export type { PickedFile, FilePickerPort } from './ports/file-picker';
export type {
  ControllerHost, HidDeviceInfo, HidOpenedInfo, HidDisconnectInfo, HidErrorInfo, VibrateStep, VibrateResult,
} from './ports/controller-host';
export type { PlatformFactory } from './factory';
export type { Platform, FactoryMap } from './platform';
