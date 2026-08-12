/* @layer renderer-other @kind logic */
/**
 * Assigns and frees "vid:pid" deviceKeys for connected Android SDL3
 * gamepads, keyed by SDL joystick id. Existing bindings/profiles/
 * calibration are keyed by a "vid:pid" string (4-hex-digit lowercase) and
 * this must keep working for the common case of one device per vid:pid; a
 * second device sharing a vid:pid gets a "#N" suffix so two physical pads
 * never collide on one key. The discriminator is freed when its device is
 * removed, so a later connect can reuse a freed slot without disturbing a
 * device still connected.
 *
 * This is a deliberate copy of the same rule implemented in
 * apps/desktop/electron/input/sdl3-device-key.ts, not an import of it: that
 * module lives in the Electron main-process zone (part of the desktop app,
 * not shared/) and is not reachable from this renderer's module graph.
 */
const toHex4 = (value: number): string => value.toString(16).padStart(4, '0');

const toVidPid = (vendorId: number, productId: number): string => `${toHex4(vendorId)}:${toHex4(productId)}`;

interface AssignedKey {
  deviceKey: string;
  vidPid: string;
  slot: number;
}

const byId = new Map<number, AssignedKey>();
const usedSlots = new Map<string, Set<number>>();

/** Assigns a deviceKey for a newly connected SDL joystick id. */
const assignDeviceKey = (sdlId: number, vendorId: number, productId: number): string => {
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

/** Frees the slot for a removed SDL joystick id. Returns its deviceKey, or
 *  undefined if this id was never assigned. */
const releaseDeviceKey = (sdlId: number): string | undefined => {
  const entry = byId.get(sdlId);
  if (!entry) return undefined;
  byId.delete(sdlId);

  const used = usedSlots.get(entry.vidPid);
  used?.delete(entry.slot);
  if (used && used.size === 0) usedSlots.delete(entry.vidPid);
  return entry.deviceKey;
};

/** The deviceKey currently assigned to a connected SDL joystick id. */
const deviceKeyForId = (sdlId: number): string | undefined => byId.get(sdlId)?.deviceKey;

export { assignDeviceKey, deviceKeyForId, releaseDeviceKey, toHex4, toVidPid };
