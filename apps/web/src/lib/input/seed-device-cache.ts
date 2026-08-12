/* @layer renderer-lib @kind logic */
/**
 * Seeds a per-device cache from the controller snapshot, not only from
 * controller:added. Three per-device caches shared this exact bug: each
 * populated itself solely from a controller:added subscription, so a device
 * already connected before that subscription existed was never recorded,
 * with no way to backfill it later. The snapshot (controller:list, kept live
 * by controller:devices) is fetched and applied the moment a cache starts,
 * then controller:added keeps recording anything that connects afterward,
 * so subscription ordering no longer matters.
 */
import type { ControllerGamepadType } from '@shared/ipc';
import { listControllerDevices, onControllerDevicesSnapshot } from './controller-devices-store';

/**
 * The subset of a snapshot entry / added-event payload a per-device cache
 * actually reads. A DeviceEntry's fields are optional (an 'unavailable'
 * device was never opened by SDL, so it has no name/sdlType/hasRumble to
 * report); a ControllerAddedInfo's are always present, since that event only
 * ever fires for a device SDL did open. Both shapes satisfy this one type,
 * so `remember` below runs unmodified against either source.
 */
interface DeviceSnapshotFields {
  deviceKey: string;
  vendorId: number;
  productId: number;
  name?: string;
  sdlType?: ControllerGamepadType;
  hasRumble?: boolean;
}

/**
 * Calls `remember` for every entry already in the controller snapshot, then
 * keeps calling it as the snapshot changes and as new devices connect.
 * `remember` decides for itself whether one entry carries enough to record
 * (a blank name, a missing sdlType, an unopened device's absent hasRumble).
 * Returns an unsubscribe that tears down both underlying subscriptions.
 */
const seedPerDeviceCache = (remember: (fields: DeviceSnapshotFields) => void): (() => void) => {
  listControllerDevices().then((entries) => entries.forEach(remember)).catch(() => {});
  const unsubSnapshot = onControllerDevicesSnapshot((entries) => entries.forEach(remember));
  const unsubAdded = window.api?.onControllerAdded?.(remember) ?? null;
  return () => {
    unsubSnapshot();
    unsubAdded?.();
  };
};

export { seedPerDeviceCache };
export type { DeviceSnapshotFields };
