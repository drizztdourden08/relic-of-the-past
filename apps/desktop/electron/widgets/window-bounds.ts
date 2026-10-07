/* @layer electron-main @kind logic */
/** Remembered window bounds kept inside the work area of the display they fall on. */
import { screen } from 'electron';
import type { WindowBounds } from '@shared/types/widget-layout';

const clampToDisplay = (wanted: WindowBounds): WindowBounds => {
  const area = screen.getDisplayMatching(wanted).workArea;
  const width = Math.min(wanted.width, area.width);
  const height = Math.min(wanted.height, area.height);
  const x = Math.min(Math.max(wanted.x, area.x), area.x + area.width - width);
  const y = Math.min(Math.max(wanted.y, area.y), area.y + area.height - height);
  return { x, y, width, height };
};

export { clampToDisplay };
