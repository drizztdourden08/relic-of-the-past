/* @layer renderer-components @kind logic */
import {
  DRAG_DEVICE_ID, DRAG_DEVICE_NAME, DRAG_PID, DRAG_SDL_TYPE, DRAG_VID,
} from './controls-settings.constants';
import { nonEmpty } from './non-empty';
import type { ReadDroppedPresetParams, PendingPreset } from './controls-settings.type';

const droppedField = (transfer: DataTransfer, type: string, fallback: string | null | undefined): string =>
  nonEmpty(transfer.getData(type)) ?? fallback ?? '';

const readDroppedPreset = ({ transfer, devices }: ReadDroppedPresetParams): PendingPreset | null => {
  const sdlType = transfer.getData(DRAG_SDL_TYPE);
  if (!sdlType) return null;

  const deviceId = transfer.getData(DRAG_DEVICE_ID);
  const device = devices.find(d => d.id === deviceId);
  return {
    sdlType,
    deviceName: droppedField(transfer, DRAG_DEVICE_NAME, device?.displayName ?? 'Unknown Device'),
    vid: droppedField(transfer, DRAG_VID, device?.vendorId),
    pid: droppedField(transfer, DRAG_PID, device?.productId),
  };
};

export { readDroppedPreset };
