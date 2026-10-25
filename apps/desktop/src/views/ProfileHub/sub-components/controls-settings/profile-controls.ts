/* @layer renderer-components @kind logic */
import { resolveDeviceControls } from '@drizztdourden08/brock-input';
import type { ResolvedControl, SdlGamepadType, DeviceEntry } from '@drizztdourden08/brock-input';
import { resolveDeviceFromEntry, recallControllerSdlType } from '@drizztdourden08/brock-input/renderer';
import { padHex } from './pad-hex';
import { ALL_AXES, ALL_BUTTONS } from './controls-settings.constants';
import type { DeviceIdentity } from './controls-settings.type';

const toHex4 = (value: number): string => value.toString(16).padStart(4, '0');

const findEntry = (vid: string, pid: string, entries: readonly DeviceEntry[]): DeviceEntry | undefined =>
  entries.find((entry) =>
    padHex(toHex4(entry.vendorId)) === vid &&
    padHex(toHex4(entry.productId)) === pid &&
    (entry.hasButton?.length ?? 0) > 0);

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

export { controlsForDevice };
