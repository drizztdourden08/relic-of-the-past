/* @layer renderer-components @kind constants */
import { BUTTON_INDEX } from '@rotp/input-mapping';
import { publicAsset } from '@app/lib/assets/public-asset';

const FAMILY_ICON_MAP: Record<string, string> = {
  xbox: publicAsset('buttons/xbox/controller_xboxseries.svg'),
  nintendo: publicAsset('buttons/switch/controller_switch_pro.svg'),
  playstation: publicAsset('buttons/playstation/controller_playstation5.svg'),
  keyboard: publicAsset('buttons/keyboard/keyboard.svg'),
  generic: publicAsset('buttons/generic/generic_joystick.svg'),
};

const AXIS_COUNT = 6;
const ALL_BUTTONS: readonly boolean[] = new Array(Object.keys(BUTTON_INDEX).length).fill(true);
const ALL_AXES: readonly boolean[] = new Array(AXIS_COUNT).fill(true);

const DRAG_SDL_TYPE = 'application/x-sdl-type';
const DRAG_DEVICE_ID = 'application/x-device-id';
const DRAG_DEVICE_NAME = 'application/x-device-name';
const DRAG_VID = 'application/x-vid';
const DRAG_PID = 'application/x-pid';

export {
  ALL_AXES, ALL_BUTTONS, AXIS_COUNT, DRAG_DEVICE_ID, DRAG_DEVICE_NAME, DRAG_PID, DRAG_SDL_TYPE,
  DRAG_VID, FAMILY_ICON_MAP,
};
