/* @layer renderer-lib @kind logic */
import type { FunctionMapping } from '@rotp/features';
import type { ButtonIcon } from '@rotp/game-data';
import { buildDeviceProfileFromSdlType } from '../..';
import { resolveStickDirectionIcon, type SdlGamepadType } from '../../family';
import { recallControllerSdlType } from '../controller-family-cache';
import type { AxisBinding, AxisEntry } from './resolve-icon-by-vid-pid.type';

const axisIcon = (ax: AxisEntry, binding: AxisBinding): ButtonIcon => {
  const dir = binding.direction === '+' ? '+' : '−';
  const label = `${ax.label} ${dir}`;
  if (ax.category === 'trigger') return { key: ax.icon, label, path: null };
  const sign = binding.direction === '+' ? 1 : -1;
  const x = ax.id.endsWith('X') ? sign : 0;
  const y = ax.id.endsWith('Y') ? sign : 0;
  return { key: resolveStickDirectionIcon(ax.icon, x, y), label, path: null };
};

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
    if (ax) return axisIcon(ax, binding);
  }
  return null;
};

export { resolveIconByVidPid };
