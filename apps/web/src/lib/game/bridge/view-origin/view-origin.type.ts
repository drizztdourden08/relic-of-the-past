/* @layer renderer-lib @kind types */
type ViewportLike = {
  cameraX: number;
  cameraY: number;
  cameraLockShiftX: number;
  cameraLockShiftY: number;
  extraLeftRight: number;
  extraTopBottom: number;
};

type ViewOrigin = { viewLeft: number; viewTop: number };

export type { ViewOrigin, ViewportLike };
