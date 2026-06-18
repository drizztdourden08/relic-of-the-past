/* @layer bridge-wasm @kind logic */
/** Viewport info (edge-glow shader) + clean-frame render. */
import { callPtr, callWhenRunning } from './wasm-call';

interface ViewportInfo {
  /** Game module: 7=dungeon, 9=overworld, 14=menu, 0/1=intro/title */
  mainModule: number;
  submodule: number;
  /** Max extra pixels per side allowed by config */
  extraLeftRight: number;
  /** Actual valid map content pixels on left beyond base 256 */
  extraLeftCur: number;
  /** Actual valid map content pixels on right beyond base 256 */
  extraRightCur: number;
  /** Actual valid map content pixels above base 224 (tall screens) */
  extraTopCur: number;
  /** Actual valid map content pixels below base 224 */
  extraBottomCur: number;
  /** Max vertical extra per side (tall budget); 0 = not tall */
  extraTopBottom: number;
  /** Total render width */
  snesWidth: number;
  /** Total render height */
  snesHeight: number;
  /** Pixels of black on the left edge (no map content) */
  blackLeft: number;
  /** Pixels of black on the right edge (no map content) */
  blackRight: number;
  /** Pixels of black on the top edge (no map content; tall screens) */
  blackTop: number;
  /** Pixels of black on the bottom edge (no map content) */
  blackBottom: number;
  /** Whether the game is in active gameplay (dungeon or overworld) */
  isGameplay: boolean;
  /** Physical location module (unaffected by text/menu overlays) */
  locationModule: number;
  /** Location type: 0=overworld/other, 1=house/cave, 2=dungeon */
  locationType: number;
  /** Camera world X position (BG2 horizontal scroll) */
  cameraX: number;
  /** Camera world Y position (BG2 vertical scroll) */
  cameraY: number;
  /** Link's world X position */
  linkX: number;
  /** Link's world Y position */
  linkY: number;
  /** Camera-lock render shift X (wide view): the rendered view sits at camera − shift. 0 = no lock. */
  cameraLockShiftX: number;
  /** Camera-lock render shift Y (tall view): the rendered view sits at camera − shift. 0 = no lock. */
  cameraLockShiftY: number;
}

/**
 * Read viewport/game-state info from WASM for shader edge detection.
 * Returns null if the module isn't running or the export doesn't exist yet.
 */
const wasmGetViewportInfo = (): ViewportInfo | null =>
  callPtr('WasmGetViewportInfo', (mod, ptr) => {
    const heap = mod.HEAPU8;
    const u16 = (off: number) => heap[ptr + off] | (heap[ptr + off + 1] << 8);
    const i16 = (off: number) => (u16(off) << 16) >> 16; // signed 16-bit (camera-lock shift can be negative)
    const mainModule = heap[ptr];
    const submodule = heap[ptr + 1];
    // extra{LeftRight,Left,Right}Cur are uint16 (can exceed 255 for very wide ratios)
    const extraLeftRight = u16(2);
    const extraLeftCur = u16(4);
    const extraRightCur = u16(6);
    const extraBottomCur = heap[ptr + 8];
    const extraTopCur = heap[ptr + 11];
    const locationModule = heap[ptr + 9];
    const locationType = heap[ptr + 10]; // 0=overworld, 1=house/cave, 2=dungeon
    const snesWidth = u16(12);
    const snesHeight = u16(14);
    const cameraX = u16(16);
    const cameraY = u16(18);
    const linkX = u16(20);
    const linkY = u16(22);
    const extraTopBottom = u16(24); // tall max budget per side (0 = not tall)
    const cameraLockShiftX = i16(26); // signed: rendered view = camera − shift (wide-view re-centering)
    const cameraLockShiftY = i16(28);

    // Black pixels = max extra - actual rendered extra
    const blackLeft = extraLeftRight - extraLeftCur;
    const blackRight = extraLeftRight - extraRightCur;
    // Vertical: tall mode budgets extraTopBottom per side; else the legacy extend_y +16 bottom-only.
    const blackTop = extraTopBottom - extraTopCur;
    const bottomBudget = extraTopBottom > 0 ? extraTopBottom : (snesHeight === 240 ? 16 : 0);
    const blackBottom = bottomBudget - extraBottomCur;

    // Active gameplay = location module 7 (dungeon) or 9 (overworld)
    const isGameplay = (locationModule === 7 || locationModule === 9);

    return {
      mainModule, submodule, extraLeftRight, extraLeftCur, extraRightCur, extraTopCur,
      extraBottomCur, extraTopBottom, snesWidth, snesHeight, blackLeft, blackRight, blackTop, blackBottom,
      isGameplay, locationModule, locationType, cameraX, cameraY, linkX, linkY,
      cameraLockShiftX, cameraLockShiftY,
    };
  });

/**
 * Render a clean frame (no HUD/BG3) into WASM memory and return the pixel data.
 * Returns null if the module isn't running or the export doesn't exist.
 */
const wasmRenderCleanFrame = (): { data: Uint8Array; width: number; height: number } | null =>
  callWhenRunning<{ data: Uint8Array; width: number; height: number } | null>(null, (mod) => {
    const ptr = mod.ccall('WasmRenderCleanFrame', 'number', [], []) as number;
    if (!ptr) return null;
    const width = mod.ccall('WasmGetCleanFrameWidth', 'number', [], []) as number;
    const height = mod.ccall('WasmGetCleanFrameHeight', 'number', [], []) as number;
    if (!width || !height) return null;
    const byteLength = width * height * 4;
    const data = mod.HEAPU8.subarray(ptr, ptr + byteLength);
    return { data, width, height };
  });

export { wasmGetViewportInfo, wasmRenderCleanFrame };
export type { ViewportInfo };
