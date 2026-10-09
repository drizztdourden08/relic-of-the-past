/* @layer electron-main @kind logic */
import type { AssignedKey } from './sdl3-device-key.type';
import { toVidPid } from './to-vid-pid';

class DeviceKeyAssigner {
  private byId = new Map<number, AssignedKey>();
  private usedSlots = new Map<string, Set<number>>();

  assign(sdlId: number, vendorId: number, productId: number): string {
    const vidPid = toVidPid(vendorId, productId);
    const used = this.usedSlots.get(vidPid) ?? new Set<number>();
    let slot = 1;
    while (used.has(slot)) slot++;
    used.add(slot);
    this.usedSlots.set(vidPid, used);

    const deviceKey = slot === 1 ? vidPid : `${vidPid}#${slot}`;
    this.byId.set(sdlId, { deviceKey, vidPid, slot });
    return deviceKey;
  }

  release(sdlId: number): string | undefined {
    const entry = this.byId.get(sdlId);
    if (!entry) return undefined;
    this.byId.delete(sdlId);

    const used = this.usedSlots.get(entry.vidPid);
    used?.delete(entry.slot);
    if (used && used.size === 0) this.usedSlots.delete(entry.vidPid);
    return entry.deviceKey;
  }

  keyFor(sdlId: number): string | undefined {
    return this.byId.get(sdlId)?.deviceKey;
  }
}

export { DeviceKeyAssigner };
