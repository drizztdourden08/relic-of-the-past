/* @layer renderer-hud @kind logic */
import type { DialogFrame } from '@rotp/game-data';
import type { DialogBoxSettings } from '../../../stores/dialog-settings-store';
import type { DialogChrome, GeometryOptions } from '../DialogView.type';

const geometryOptionsOf = (frame: DialogFrame, look: DialogBoxSettings, chrome: DialogChrome): GeometryOptions => {
  const { native, padX, padY } = chrome;
  return {
    mode: native ? 'native' : look.boxFit,
    fontScale: native ? 1 : look.fontScale,
    padX,
    padY,
    shiftX: native ? frame.layerScrollX : 0,
    shiftY: native ? frame.layerScrollY : 0,
  };
};

export { geometryOptionsOf };
