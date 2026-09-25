/* @layer renderer-lib @kind logic */
/**
 * A profile, resolved into the two binding lenses the per-frame router reads.
 *
 * They are separate because they answer different questions and are available at different
 * times. The MODERN lens says which physical control is which assignable slot, and only the
 * modern scheme has any use for it. A gamepad profile whose pad is not currently connected
 * resolves to null, not to a guess, so a disconnect degrades to "no slots" instead of
 * to phantom ones. The CORE lens is the ten verbs, four of which are the menu's, and it
 * exists under BOTH schemes (contract §5: `core` is carried by classic profiles too).
 *
 * That distinction is the whole reason this file exists. The enhanced pause menu can be on
 * screen under the classic scheme, and while it is, the only way out is a menu verb. So the
 * router must be able to read those verbs on a frame where the modern lens is null.
 *
 * They are two lenses on one profile, not two opinions about it: the modern lens is BUILT on
 * the core lens, so whichever core `resolveCoreBindings` answers with is the core the slots
 * were subtracted from. Nothing downstream can be shown a core and a slot list that disagree
 * about who owns the d-pad.
 */
import { padHex } from './profile-devices';
import { resolveDeviceFromEntry } from './resolve-device';
import { defaultCoreBindings, effectiveModernBindings, keyboardModernBindings } from '@shared/input/scheme';
import type { DeviceEntry } from '@shared/ipc';
import type { CoreBindings, InputProfile, ModernBindings } from '@shared/types/controls';
import type { ResolvedControl } from '@shared/input/family';

const deviceKeyOfEntry = (entry: DeviceEntry): string =>
  `${padHex(entry.vendorId.toString(16))}:${padHex(entry.productId.toString(16))}`;

/** The connected device this profile is assigned to, or null when it is absent or unassigned. */
const profileDevice = (profile: InputProfile, devices: readonly DeviceEntry[]): DeviceEntry | null => {
  const assigned = profile.assignedDevice;
  if (!assigned) return null;
  const wanted = `${padHex(assigned.vendorId)}:${padHex(assigned.productId)}`;
  return devices.find((d) => (d.deviceKey ?? deviceKeyOfEntry(d)) === wanted) ?? null;
};

/**
 * The ten core verbs for a profile, under either scheme.
 *
 * `profile.core` first, because that is where a core rebind lands whether or not the profile
 * ever grew a modern block (see useModernScheme, which resolves in the same order for the
 * controls screen); then the modern block's own copy; then the device's defaults.
 */
const resolveCoreBindings = (profile: InputProfile | null, devices: readonly DeviceEntry[]): CoreBindings | null => {
  if (!profile) return null;
  if (profile.core) return profile.core;
  if (profile.modern) return profile.modern.core;
  if (profile.deviceType === 'keyboard') return keyboardModernBindings().core;
  const entry = profileDevice(profile, devices);
  if (!entry) return null;
  return defaultCoreBindings(resolveDeviceFromEntry(entry).controls);
};

/** What the profile's device reports right now; empty when it is absent or is a keyboard. */
const profileControls = (profile: InputProfile, devices: readonly DeviceEntry[]): readonly ResolvedControl[] => {
  if (profile.deviceType === 'keyboard') return [];
  const entry = profileDevice(profile, devices);
  return entry ? resolveDeviceFromEntry(entry).controls : [];
};

/**
 * The modern lens for a profile: the SAME core `resolveCoreBindings` answers with, and the
 * slots that core leaves free.
 *
 * The slot list is the PLAYER'S, stored on the profile and read back as written (contract
 * §19). `effectiveSlots` is the one function that answers it, and both lenses (this one and
 * the controls screen's) go through it, so there is exactly one list and it cannot go stale
 * relative to itself. It falls back to the device's own prefill only for a profile that has
 * never been edited: the keyboard preset for a keyboard, `defaultSlotList` for a connected
 * pad, and nothing at all for a pad that is neither stored nor plugged in.
 *
 * Null when there is nothing honest to answer with: a gamepad profile whose pad is not
 * connected AND which carries no stored record resolves to "no slots" instead of to a guess
 * about a device we have never seen.
 */
const resolveModernBindings = (profile: InputProfile | null, devices: readonly DeviceEntry[]): ModernBindings | null => {
  if (!profile) return null;
  const core = resolveCoreBindings(profile, devices);
  if (!core) return null;
  const keyboard = profile.deviceType === 'keyboard';
  const controls = profileControls(profile, devices);
  if (!keyboard && controls.length === 0 && !profile.modern) return null;
  return effectiveModernBindings({
    core, controls, keyboard, stored: profile.modern?.slots, layoutId: profile.modern?.layoutId,
  });
};

export { resolveCoreBindings, resolveModernBindings };
