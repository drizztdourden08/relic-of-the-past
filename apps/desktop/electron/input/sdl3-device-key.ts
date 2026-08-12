/* @layer electron-main @kind logic */
/**
 * Assigns and frees deviceKeys for connected SDL joysticks — the collision
 * rule is documented at the top of sdl3-source.ts. In short: "vid:pid" is
 * the key while it is unique among currently connected devices; the second
 * and later device sharing a vid:pid (the GameCube adapter's four ports are
 * the reason this exists) gets a "#N" suffix. Slots are tracked per
 * vid:pid rather than counted, so removing a mid-numbered device frees
 * exactly its own slot — a later connect can reuse the lowest free slot
 * (including the plain key) without disturbing devices already connected.
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
