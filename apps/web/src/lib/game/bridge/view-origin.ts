/* @layer renderer-lib @kind logic */
/**
 * Where the rendered frame starts, in world pixels.
 *
 * The frame is not the camera: a wide view draws `extraLeftRight` pixels before the camera's own column,
 * a tall view draws `extraTopBottom` rows before its first row, and the camera lock shifts the whole
 * picture so its edge can rest on the map boundary. Anything drawn over the game (the navigation overlay,
 * the shadow editor, a tile tooltip) has to start from the same origin the core drew from, or it sits off
 * the thing it marks.
 *
 * Every consumer used to derive this inline, which is how four of them came to carry the lock shift, two
 * did not, and none carried the rows a tall view adds on top.
 */
type ViewportLike = {
  cameraX: number;
  cameraY: number;
  cameraLockShiftX: number;
  cameraLockShiftY: number;
  extraLeftRight: number;
  extraTopBottom: number;
};

type ViewOrigin = { viewLeft: number; viewTop: number };

/** The original picture's line count, which every view measures its extra rows against. */
const BASE_PICTURE_LINES = 224;

const viewOrigin = (vp: ViewportLike): ViewOrigin => ({
  viewLeft: vp.cameraX - vp.cameraLockShiftX - vp.extraLeftRight,
  viewTop: vp.cameraY - vp.cameraLockShiftY - vp.extraTopBottom,
});

/**
 * Game lines drawn above the 224-line picture. A tall view adds the same budget above and below; the
 * 240-line view adds its 16 lines below only, so a surplus of exactly 16 means nothing on top. Anything
 * laid over the picture (the HUD, the message box) has to start below these, or it floats in the band.
 */
const linesAbovePicture = (nativeHeight: number, reported?: number): number => {
  if (reported !== undefined) return reported;
  const surplus = nativeHeight - BASE_PICTURE_LINES;
  return surplus === 16 ? 0 : surplus / 2;
};

export { viewOrigin, linesAbovePicture };
export type { ViewOrigin, ViewportLike };
