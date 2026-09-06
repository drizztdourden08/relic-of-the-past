/* @layer renderer-lib @kind logic */
/**
 * Renderer wrappers for the SDL3 controller device-list IPC surface: the
 * full ready+unavailable snapshot, rescan, and the user mapping database.
 * Sits next to controllers-store.ts (which fronts the cross-platform
 * ControllerHost port), not inside it, because this surface is
 * desktop-only for now and has no port of its own yet. window.api is
 * always present (real preload on Electron, a generated no-op shim
 * elsewhere), so these are thin, direct pass-throughs.
 */
import type { DeviceEntry, HidListedDevice } from '@shared/ipc';

const listControllerDevices = (): Promise<DeviceEntry[]> => window.api.listControllers();

/** The raw HID enumeration, independent of SDL claim state (see HidListedDevice). */
const listHidDevices = (): Promise<HidListedDevice[]> => window.api.listHidDevices();

const rescanControllerDevices = (): Promise<void> => window.api.rescanControllers();

const addControllerMapping = (mapping: string): Promise<boolean> => window.api.addControllerMapping(mapping);

const onControllerDevicesSnapshot = (cb: (devices: DeviceEntry[]) => void): (() => void) =>
  window.api.onControllerDevices(cb);

export { addControllerMapping, listControllerDevices, listHidDevices, onControllerDevicesSnapshot, rescanControllerDevices };
