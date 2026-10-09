/* @layer bridge-wasm @kind types */
interface ViewportInfo {
  mainModule: number;
  submodule: number;
  extraLeftRight: number;
  extraLeftCur: number;
  extraRightCur: number;
  extraTopCur: number;
  extraBottomCur: number;
  extraTopBottom: number;
  snesWidth: number;
  snesHeight: number;
  blackLeft: number;
  blackRight: number;
  blackTop: number;
  blackBottom: number;
  isGameplay: boolean;
  locationModule: number;
  locationType: number;
  cameraX: number;
  cameraY: number;
  linkX: number;
  linkY: number;
  cameraLockShiftX: number;
  cameraLockShiftY: number;
  inDoorway: number;
  doorAnimStep: number;
}

type CleanFrame = { data: Uint8Array; width: number; height: number };

export type { ViewportInfo, CleanFrame };
