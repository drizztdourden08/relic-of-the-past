/* @layer renderer-other @kind logic */
import { deviceKeySlots } from './device-key-slots';

const releaseDeviceKey = (sdlId: number): string | undefined => {
  const { byId, usedSlots } = deviceKeySlots;
  const entry = byId.get(sdlId);
  if (!entry) return undefined;
  byId.delete(sdlId);

  const used = usedSlots.get(entry.vidPid);
  used?.delete(entry.slot);
  if (used && used.size === 0) usedSlots.delete(entry.vidPid);
  return entry.deviceKey;
};

export { releaseDeviceKey };
