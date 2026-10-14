/* @layer renderer-hud @kind types */
import type { DialogBorderLook } from '../DialogBox.type';

interface DialogLookInput {
  bordered: boolean;
  border: DialogBorderLook;
  tile: number;
  wantsFeather: boolean;
  tilesOk: boolean;
}

export type { DialogLookInput };
