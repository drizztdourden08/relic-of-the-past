/* @layer renderer-other @kind logic */
import { deviceKeySlots } from './device-key-slots';
import { toVidPid } from './to-vid-pid';

const assignDeviceKey = (sdlId: number, vendorId: number, productId: number): string => {
  const { byId, usedSlots } = deviceKeySlots;
  const vidPid = toVidPid(vendorId, productId);
  const used = usedSlots.get(vidPid) ?? new Set<number>();
  let slot = 1;
  while (used.has(slot)) slot++;
  used.add(slot);
  usedSlots.set(vidPid, used);

  const deviceKey = slot === 1 ? vidPid : `${vidPid}#${slot}`;
  byId.set(sdlId, { deviceKey, vidPid, slot });
  return deviceKey;
};

export { assignDeviceKey };
