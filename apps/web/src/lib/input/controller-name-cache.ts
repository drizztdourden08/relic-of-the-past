/* @layer renderer-lib @kind logic */
/**
 * Names for every controller seen this session, recorded from the
 * controller snapshot and kept live by controller:added (see
 * seed-device-cache.ts), not from that one-shot event alone: a device
 * already connected before this module's subscription existed announces
 * itself exactly once, at connect, so an event-only listener never learns
 * its name at all.
 *
 * The OS-level product string is not a substitute: devices reached over a
 * raw USB interface report it empty, which is how a controller ends up
 * displayed as "Unknown Controller" while its real name sits one component
 * away. Recording names centrally, from app start, is what makes them
 * available to any screen at any time.
 *
 * Keyed both by device key and by vendor:product, since a caller working
 * from a raw device list has ids but no device key.
 */
import { seedPerDeviceCache } from './seed-device-cache';

const byDeviceKey = new Map<string, string>();
const byVidPid = new Map<string, string>();

const hex4 = (value: number): string => value.toString(16).padStart(4, '0');

const vidPidKey = (vendorId: number, productId: number): string => `${hex4(vendorId)}:${hex4(productId)}`;

/** Records a name. Ignores blank names so a later real one is not shadowed. */
const rememberControllerName = (params: { deviceKey: string; vendorId: number; productId: number; name: string }): void => {
  const { deviceKey, vendorId, productId, name } = params;
  const trimmed = name.trim();
  if (!trimmed) return;
  byDeviceKey.set(deviceKey, trimmed);
  byVidPid.set(vidPidKey(vendorId, productId), trimmed);
};

/** Best known name, or null. Device key wins; ids are the fallback. */
const recallControllerName = (params: { deviceKey?: string; vendorId?: number; productId?: number }): string | null => {
  const { deviceKey, vendorId, productId } = params;
  if (deviceKey) {
    const hit = byDeviceKey.get(deviceKey);
    if (hit) return hit;
  }
  if (vendorId != null && productId != null) {
    return byVidPid.get(vidPidKey(vendorId, productId)) ?? null;
  }
  return null;
};

let unsubscribe: (() => void) | null = null;

/**
 * Starts recording, once per session. Seeded from the current controller
 * snapshot immediately, then kept live by controller:devices and
 * controller:added, so a device attached before this module ever ran still
 * has its name captured.
 */
const startControllerNameCache = (): (() => void) => {
  if (unsubscribe) return () => { /* already recording for this session */ };
  unsubscribe = seedPerDeviceCache((fields) => {
    if (!fields.name) return;
    rememberControllerName({
      deviceKey: fields.deviceKey,
      vendorId: fields.vendorId,
      productId: fields.productId,
      name: fields.name,
    });
  });
  return () => { /* deliberately never torn down; the cache outlives any screen */ };
};

// Begin recording as soon as this module is reachable, instead of waiting for
// a caller. Nothing here polls or holds a device; it only listens.
if (typeof window !== 'undefined') {
  startControllerNameCache();
}

export { recallControllerName, rememberControllerName, startControllerNameCache };
