/* @layer renderer-components @kind logic */
import {
  DRAG_DEVICE_NAME, DRAG_PID, DRAG_SDL_TYPE, DRAG_VID,
} from '../controls-settings/controls-settings.constants';
import type { DeviceDragInfo } from './controls.type';

const setDeviceDragData = (e: React.DragEvent, info: DeviceDragInfo): void => {
  e.dataTransfer.setData(DRAG_DEVICE_NAME, info.displayName);
  e.dataTransfer.setData(DRAG_SDL_TYPE, info.sdlType ?? '');
  e.dataTransfer.setData(DRAG_VID, info.vendorId ?? '');
  e.dataTransfer.setData(DRAG_PID, info.productId ?? '');
  e.dataTransfer.effectAllowed = 'copy';
};

export { setDeviceDragData };
