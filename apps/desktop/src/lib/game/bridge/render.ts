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
  /** Actual valid map content pixels below base 224 */
  extraBottomCur: number;
  /** Total render width */
  snesWidth: number;
  /** Total render height */
  snesHeight: number;
  /** Pixels of black on the left edge (no map content) */
  blackLeft: number;
  /** Pixels of black on the right edge (no map content) */
  blackRight: number;
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
}

/**
 * Read viewport/game-state info from WASM for shader edge detection.
 * Returns null if the module isn't running or the export doesn't exist yet.
 */
const wasmGetViewportInfo = (): ViewportInfo | null =>
  callPtr('WasmGetViewportInfo', (mod, ptr) => {
    const heap = mod.HEAPU8;
    const mainModule = heap[ptr];
    const submodule = heap[ptr + 1];
    const extraLeftRight = heap[ptr + 2];
    const extraLeftCur = heap[ptr + 3];
    const extraRightCur = heap[ptr + 4];
    const extraBottomCur = heap[ptr + 5];
    const snesWidth = heap[ptr + 6] | (heap[ptr + 7] << 8);
    const snesHeight = heap[ptr + 8] | (heap[ptr + 9] << 8);
    const locationModule = heap[ptr + 10];
    const locationType = heap[ptr + 11]; // 0=overworld, 1=house/cave, 2=dungeon
    const cameraX = heap[ptr + 12] | (heap[ptr + 13] << 8);
    const cameraY = heap[ptr + 14] | (heap[ptr + 15] << 8);
    const linkX = heap[ptr + 16] | (heap[ptr + 17] << 8);
    const linkY = heap[ptr + 18] | (heap[ptr + 19] << 8);

    // Black pixels = max extra - actual rendered extra
    const blackLeft = extraLeftRight - extraLeftCur;
    const blackRight = extraLeftRight - extraRightCur;
    // Bottom: extend_y adds 16 rows (240-224), extraBottomCur = how many have content
    const blackBottom = snesHeight === 240 ? (16 - extraBottomCur) : 0;

    // Active gameplay = location module 7 (dungeon) or 9 (overworld)
    const isGameplay = (locationModule === 7 || locationModule === 9);

    return {
      mainModule, submodule, extraLeftRight, extraLeftCur, extraRightCur,
      extraBottomCur, snesWidth, snesHeight, blackLeft, blackRight, blackBottom,
      isGameplay, locationModule, locationType, cameraX, cameraY, linkX, linkY,
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
