/* @layer renderer-lib @kind logic */
import type { DeviceScopedMap } from './device-scoped-map.type';

const setScoped = <K, V>(map: DeviceScopedMap<K, V>, deviceKey: string, key: K, value: V): void => {
  let inner = map.get(deviceKey);
  if (!inner) {
    inner = new Map<K, V>();
    map.set(deviceKey, inner);
  }
  inner.set(key, value);
};

export { setScoped };
