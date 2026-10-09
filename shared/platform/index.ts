/* @layer shared-platform @kind barrel */
export { isPrimaryModifier } from './is-primary-modifier';
export { primaryModifierLabel } from './primary-modifier-label';
export type { ModifierFlags } from './primary-modifier.type';

export type { HostShell, OsKind, FormFactor, InputModel, PlatformInfo, Capabilities } from './platform-info.type';
export type { WindowControlsPort, Unsub } from './ports/window-controls.type';
export type { DataDomain, DataLocation, DomainUsage, StorageSummary, StoragePort } from './ports/storage.type';
export type { FileStat, FileStore } from './ports/file-store.type';
export type { PickedFile, SaveFileRequest, SaveFileResult, FilePickerPort } from './ports/file-picker.type';
export type { DevicePort } from './ports/device.type';
