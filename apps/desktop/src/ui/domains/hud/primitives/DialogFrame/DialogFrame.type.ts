/* @layer renderer-hud @kind types */
import type { DialogBorderThickness, DialogCorner, DialogCornerMark } from '@rotp/game-data';

interface DialogFrameProps {
  width: number;
  height: number;
  tile: number;
  border: 'single' | 'double';
  thickness: DialogBorderThickness;
  color: string;
  corner: DialogCorner;
  mark: DialogCornerMark;
  markAngle: number;
}

export type { DialogFrameProps };
