/* @layer renderer-components @kind logic */
import {
  DRAG_DEVICE_NAME, DRAG_PID, DRAG_SDL_TYPE, DRAG_VID,
} from './controls-settings.constants';
import type { ReadDroppedPresetParams, PendingPreset } from './controls-settings.type';

const readDroppedPreset = ({ transfer }: ReadDroppedPresetParams): PendingPreset | null => {
  const sdlType = transfer.getData(DRAG_SDL_TYPE);
  if (!sdlType) return null;

  return {
    sdlType,
    deviceName: transfer.getData(DRAG_DEVICE_NAME),
    vid: transfer.getData(DRAG_VID),
    pid: transfer.getData(DRAG_PID),
  };
};

export { readDroppedPreset };
