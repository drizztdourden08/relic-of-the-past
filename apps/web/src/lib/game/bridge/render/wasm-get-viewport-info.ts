/* @layer bridge-wasm @kind logic */
import { callPtr } from '../wasm-call';
import { DUNGEON_MODULE, EXTEND_Y_BOTTOM_LINES, EXTEND_Y_HEIGHT, OVERWORLD_MODULE } from './render.constants';
import type { ViewportInfo } from './render.type';

const wasmGetViewportInfo = (): ViewportInfo | null =>
  callPtr('WasmGetViewportInfo', (mod, ptr) => {
    const heap = mod.HEAPU8;
    const u16 = (off: number) => heap[ptr + off] | (heap[ptr + off + 1] << 8);
    const signedI16 = (off: number) => (u16(off) << 16) >> 16;
    const mainModule = heap[ptr];
    const submodule = heap[ptr + 1];
    const extraLeftRight = u16(2);
    const extraLeftCur = u16(4);
    const extraRightCur = u16(6);
    const extraBottomCur = heap[ptr + 8];
    const extraTopCur = heap[ptr + 11];
    const locationModule = heap[ptr + 9];
    const locationType = heap[ptr + 10];
    const snesWidth = u16(12);
    const snesHeight = u16(14);
    const cameraX = u16(16);
    const cameraY = u16(18);
    const linkX = u16(20);
    const linkY = u16(22);
    const extraTopBottom = u16(24);
    const cameraLockShiftX = signedI16(26);
    const cameraLockShiftY = signedI16(28);
    const inDoorway = heap[ptr + 30];
    const doorAnimStep = heap[ptr + 31];

    const blackLeft = extraLeftRight - extraLeftCur;
    const blackRight = extraLeftRight - extraRightCur;
    const blackTop = extraTopBottom - extraTopCur;
    const bottomBudget = extraTopBottom > 0 ? extraTopBottom : (snesHeight === EXTEND_Y_HEIGHT ? EXTEND_Y_BOTTOM_LINES : 0);
    const blackBottom = bottomBudget - extraBottomCur;

    const isGameplay = (locationModule === DUNGEON_MODULE || locationModule === OVERWORLD_MODULE);

    return {
      mainModule, submodule, extraLeftRight, extraLeftCur, extraRightCur, extraTopCur,
      extraBottomCur, extraTopBottom, snesWidth, snesHeight, blackLeft, blackRight, blackTop, blackBottom,
      isGameplay, locationModule, locationType, cameraX, cameraY, linkX, linkY,
      cameraLockShiftX, cameraLockShiftY, inDoorway, doorAnimStep,
    };
  });

export { wasmGetViewportInfo };
