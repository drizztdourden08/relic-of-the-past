/* @layer electron-main @kind logic */
/**
 * Assigns and frees deviceKeys for connected SDL joysticks (rule at the top of
 * sdl3-source.ts): "vid:pid" while unique, "#N" suffix for the second and later
 * device sharing one. Slots are tracked per vid:pid, not counted, so removing a
 * mid-numbered device frees exactly its own slot.
 */
const toVidPid = (vendorId: number, productId: number): string =>
  `${vendorId.toString(16).padStart(4, '0')}:${productId.toString(16).padStart(4, '0')}`;

interface AssignedKey {
  deviceKey: string;
  vidPid: string;
  slot: number;
}

class DeviceKeyAssigner {
  private byId = new Map<number, AssignedKey>();
  private usedSlots = new Map<string, Set<number>>();

  /** Assigns a deviceKey for a newly connected SDL joystick id. */
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

  /** Frees the slot for a removed SDL joystick id. Returns its deviceKey, or
   *  undefined if this id was never assigned. */
  release(sdlId: number): string | undefined {
    const entry = this.byId.get(sdlId);
    if (!entry) return undefined;
    this.byId.delete(sdlId);

    const used = this.usedSlots.get(entry.vidPid);
    used?.delete(entry.slot);
    if (used && used.size === 0) this.usedSlots.delete(entry.vidPid);
    return entry.deviceKey;
  }

  /** The deviceKey currently assigned to a connected SDL joystick id. */
  keyFor(sdlId: number): string | undefined {
    return this.byId.get(sdlId)?.deviceKey;
  }
}

export { DeviceKeyAssigner, toVidPid };
