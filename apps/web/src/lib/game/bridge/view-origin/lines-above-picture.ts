/* @layer renderer-lib @kind logic */
import { BASE_PICTURE_LINES, BOTTOM_ONLY_SURPLUS } from './view-origin.constants';

const linesAbovePicture = (nativeHeight: number, reported?: number): number => {
  if (reported !== undefined) return reported;
  const surplus = nativeHeight - BASE_PICTURE_LINES;
  return surplus === BOTTOM_ONLY_SURPLUS ? 0 : surplus / 2;
};

export { linesAbovePicture };
