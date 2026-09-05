/* @layer renderer-lib @kind logic */
/**
 * Create InputProfiles from presets and resolve
 * function mapping display icons.
 */

import type { InputProfile, FunctionMapping, ButtonIcon, DevicePreset } from '@shared/types/controls';
import { buildDeviceProfileFromSdlType } from '@shared/input';
import { resolveStickDirectionIcon, type SdlGamepadType } from '@shared/input/family';
import { recallControllerSdlType } from './controller-family-cache';

const profileFromPreset = (preset: DevicePreset): InputProfile => {
  return {
    id: `default-${preset.id}`,
    name: preset.name,
    deviceType: preset.family === 'keyboard' ? 'keyboard' : 'gamepad',
    deviceFamily: preset.family,
    mappings: [...preset.defaultMappings],
    isDefault: true,
    assignedDevice: null,
    createdAt: Date.now(),
    modifiedAt: Date.now(),
  };
};

/** Resolves the icon for a saved binding by vid/pid + binding index, through
 *  the family layer. The device need not be currently connected, only its
 *  SDL type from this session's controller-family-cache is required; a
 *  `liveSdlType` (a currently-connected device's own reported type) fills in
 *  when the cache has no record yet, which happens for anything that
 *  connected before this session's cache started listening. Builds the
 *  synthetic "assume every position present" profile (never the live
 *  hasButton/hasAxis-gated one), so a binding index always lands on the same
 *  array slot regardless of what a live unit of this device actually has. */
const resolveIconByVidPid = (
  vid: string,
  pid: string,
  binding: FunctionMapping['binding'],
  liveSdlType?: string | null,
): ButtonIcon | null => {
  const sdlType = recallControllerSdlType(parseInt(vid, 16), parseInt(pid, 16)) ?? (liveSdlType as SdlGamepadType | null | undefined) ?? null;
  if (!sdlType) return null;
  const profile = buildDeviceProfileFromSdlType(
    { id: sdlType, name: sdlType, family: 'generic', inputApi: 'hid', vendorId: vid, productId: pid },
    sdlType,
  );
  if (binding.type === 'gamepad-button') {
    const b = profile.buttonsByIndex[binding.index];
    if (b) return { key: b.icon, label: b.label, path: null };
  }
  if (binding.type === 'gamepad-axis') {
    const ax = profile.axes[binding.axisIndex];
    if (ax) {
      const dir = binding.direction === '+' ? '+' : '−';
      const label = `${ax.label} ${dir}`;
      // A trigger axis has no direction to speak of: it shows its own
      // glyph. A stick axis shares one base key between its X and Y, so
      // the binding's own axis (X vs Y) and direction pick which of the
      // four pushed glyphs (or the neutral pose) actually shows.
      if (ax.category === 'trigger') return { key: ax.icon, label, path: null };
      const sign = binding.direction === '+' ? 1 : -1;
      const x = ax.id.endsWith('X') ? sign : 0;
      const y = ax.id.endsWith('Y') ? sign : 0;
      return { key: resolveStickDirectionIcon(ax.icon, x, y), label, path: null };
    }
  }
  return null;
};

const resolveFunctionMappingIcon = (m: FunctionMapping, liveSdlType?: string | null): ButtonIcon | null => {
  if (m.icon) return m.icon;
  if (m.binding.type === 'none' || m.binding.type === 'keyboard') return null;
  const vid = m.sourceVid?.toLowerCase().padStart(4, '0');
  const pid = m.sourcePid?.toLowerCase().padStart(4, '0');
  if (!vid || !pid) return null;
  return resolveIconByVidPid(vid, pid, m.binding, liveSdlType);
};

export { profileFromPreset, resolveFunctionMappingIcon, resolveIconByVidPid };
