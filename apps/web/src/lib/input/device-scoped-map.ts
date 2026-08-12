/* @layer renderer-lib @kind logic */
/**
 * A binding lookup keyed first by the device that created it, then by the
 * binding's own key (a button index, or an "axisIndex:direction" string).
 * Keeps every button/axis map scoped to one physical controller, so a
 * binding recorded from one pad can never fire from another pad that
 * happens to share the same button index.
 *
 * A binding with no recorded source device (older profiles, and the
 * console-default presets, never stamp one) is filed under ANY_DEVICE and
 * matches every gamepad — treating it as scoped to nothing would silently
 * break every profile that predates per-device binding.
 */
import { padHex } from './profile-devices';

const ANY_DEVICE = '*';

type DeviceScopedMap<K, V> = Map<string, Map<K, V>>;

/** Resolve the device key a binding is scoped to, or ANY_DEVICE if unset. */
const deviceKeyFor = (sourceVid?: string | null, sourcePid?: string | null): string =>
  sourceVid && sourcePid ? `${padHex(sourceVid)}:${padHex(sourcePid)}` : ANY_DEVICE;

/** Record one binding under its owning device, creating the inner map on first use. */
const setScoped = <K, V>(map: DeviceScopedMap<K, V>, deviceKey: string, key: K, value: V): void => {
  let inner = map.get(deviceKey);
  if (!inner) {
    inner = new Map<K, V>();
    map.set(deviceKey, inner);
  }
  inner.set(key, value);
};

/** Every binding that applies to this device: its own scoped bindings, plus any source-less ones. */
const scopedEntries = <K, V>(map: DeviceScopedMap<K, V>, deviceKey: string): [K, V][] => {
  const entries: [K, V][] = [];
  const own = map.get(deviceKey);
  if (own) entries.push(...own);
  if (deviceKey !== ANY_DEVICE) {
    const any = map.get(ANY_DEVICE);
    if (any) entries.push(...any);
  }
  return entries;
};

export { ANY_DEVICE, deviceKeyFor, scopedEntries, setScoped };
export type { DeviceScopedMap };
