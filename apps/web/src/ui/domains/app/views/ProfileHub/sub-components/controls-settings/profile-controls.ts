/* @layer renderer-components @kind logic */
/**
 * "What does this profile's device physically have?" for the controls screen.
 *
 * The modern scheme prefills its slot list from the device's resolved control list,
 * so the screen needs that list for the profile being edited, even while
 * the pad is unplugged, otherwise the slot list would empty itself the moment
 * a controller sleeps.
 *
 * Three sources, in order:
 *  1. A live SDL entry for the profile's assigned vid:pid, which carries the real
 *     hasButton/hasAxis, so only what the unit actually reports appears.
 *  2. This session's remembered SDL type for that vid:pid, expanded through
 *     the same synthetic "assume every position present" list the saved-binding
 *     icon lookup already uses. A disconnected pad keeps its slots.
 *  3. Nothing, for a keyboard profile (SDL never enumerates one) or a profile with
 *     no device assigned yet. The keyboard's own modern bindings come from
 *     `keyboardModernBindings()` instead, which needs no control list.
 */
import { BUTTON_INDEX, resolveDeviceControls } from '@shared/input/family';
import { resolveDeviceFromEntry } from '@app/lib/input/resolve-device';
import { recallControllerSdlType } from '@app/lib/input/controller-family-cache';
import { padHex } from './controls-settings.type';
import type { ResolvedControl, SdlGamepadType } from '@shared/input/family';
import type { DeviceEntry } from '@shared/ipc';
import type { InputProfile } from '@shared/types/controls';

const AXIS_COUNT = 6;
const ALL_BUTTONS: readonly boolean[] = new Array(Object.keys(BUTTON_INDEX).length).fill(true);
const ALL_AXES: readonly boolean[] = new Array(AXIS_COUNT).fill(true);

const toHex4 = (value: number): string => value.toString(16).padStart(4, '0');

interface DeviceIdentity {
  vid: string;
  pid: string;
  /** Falls back to the session cache when the caller has no live type. */
  sdlType?: string | null;
}

const findEntry = (vid: string, pid: string, entries: readonly DeviceEntry[]): DeviceEntry | undefined =>
  entries.find((entry) =>
    padHex(toHex4(entry.vendorId)) === vid &&
    padHex(toHex4(entry.productId)) === pid &&
    (entry.hasButton?.length ?? 0) > 0);

/** The resolved control list for one device, live if it is plugged in. */
const controlsForDevice = (identity: DeviceIdentity, entries: readonly DeviceEntry[]): ResolvedControl[] => {
  const vid = padHex(identity.vid);
  const pid = padHex(identity.pid);
  if (!vid || !pid) return [];

  const entry = findEntry(vid, pid, entries);
  if (entry) return [...resolveDeviceFromEntry(entry).controls];

  const remembered = recallControllerSdlType(parseInt(vid, 16), parseInt(pid, 16));
  const sdlType = (remembered ?? identity.sdlType ?? null) as SdlGamepadType | null;
  if (!sdlType) return [];

  return resolveDeviceControls({
    sdlType,
    vendorId: vid,
    productId: pid,
    hasButton: ALL_BUTTONS,
    hasAxis: ALL_AXES,
    buttonLabels: [],
  });
};

const controlsForProfile = (profile: InputProfile | null, entries: readonly DeviceEntry[]): ResolvedControl[] => {
  if (!profile || profile.deviceType === 'keyboard') return [];
  const assigned = profile.assignedDevice;
  if (!assigned?.vendorId || !assigned.productId) return [];
  return controlsForDevice({ vid: assigned.vendorId, pid: assigned.productId }, entries);
};

export { controlsForDevice, controlsForProfile };
export type { DeviceIdentity };
