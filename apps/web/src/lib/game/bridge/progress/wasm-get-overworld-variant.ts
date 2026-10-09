/* @layer bridge-wasm @kind logic */
import { callWhenRunning } from '../wasm-call';
import { phaseLabelFor } from './phase-label-for';
import { EVENT_OVERLAY_BIT, OW_SCREEN_INDEX_MASK } from './progress.constants';
import type { OverworldVariantInfo } from './progress.type';

const wasmGetOverworldVariant = (screenIndex: number): OverworldVariantInfo | null =>
  callWhenRunning<OverworldVariantInfo | null>(null, (mod) => {
    const heap = mod.HEAPU8;

    const progPtr = mod.ccall('WasmGetProgressFlags', 'number', [], []) as number;
    if (!progPtr) return null;
    const progressIndicator = heap[progPtr];

    const owPtr = mod.ccall('WasmGetOverworldFlags', 'number', [], []) as number;
    if (!owPtr) return null;
    const screenEventFlags = heap[owPtr + (screenIndex & OW_SCREEN_INDEX_MASK)];
    const eventOverlayActive = !!(screenEventFlags & EVENT_OVERLAY_BIT);

    return {
      progressIndicator,
      screenEventFlags,
      eventOverlayActive,
      phaseLabel: phaseLabelFor(progressIndicator),
    };
  });

export { wasmGetOverworldVariant };
