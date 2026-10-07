/* @layer bridge-wasm @kind logic */
/** Universal progress indicator + overworld variant state. */
import { callWhenRunning } from './wasm-call';

interface OverworldVariantInfo {
  /** sram_progress_indicator: 0=intro, 1=post-uncle, 2=princess-rescued, 3=agahnim-defeated */
  progressIndicator: number;
  /** save_ow_event_info[screen] for the current screen */
  screenEventFlags: number;
  /** Whether the event overlay has been applied (bit 0x20) */
  eventOverlayActive: boolean;
  /** Human label for the current variant phase */
  phaseLabel: string;
}

interface GameProgressInfo {
  /** Raw sram_progress_indicator value (0-3) */
  tier: number;
  /** Human-readable phase label */
  label: string;
}

const PHASE_LABELS = ['intro', 'rain (pre-Sanctuary)', 'post-Sanctuary', 'post-Agahnim'];

/**
 * Read the game's progress indicator from WRAM. Works indoors or outdoors.
 * Returns null only when game is not running.
 */
const wasmGetProgressIndicator = (): GameProgressInfo | null =>
  callWhenRunning<GameProgressInfo | null>(null, (mod) => {
    const progPtr = mod.ccall('WasmGetProgressFlags', 'number', [], []) as number;
    if (!progPtr) return null;
    const tier = mod.HEAPU8[progPtr];
    return { tier, label: PHASE_LABELS[tier] ?? `unknown (${tier})` };
  });

/**
 * Read the current overworld variant state: progress tier + per-screen event flags.
 */
const wasmGetOverworldVariant = (screenIndex: number): OverworldVariantInfo | null =>
  callWhenRunning<OverworldVariantInfo | null>(null, (mod) => {
    const heap = mod.HEAPU8;

    const progPtr = mod.ccall('WasmGetProgressFlags', 'number', [], []) as number;
    if (!progPtr) return null;
    const progressIndicator = heap[progPtr];

    const owPtr = mod.ccall('WasmGetOverworldFlags', 'number', [], []) as number;
    if (!owPtr) return null;
    const screenEventFlags = heap[owPtr + (screenIndex & 0x7F)];
    const eventOverlayActive = !!(screenEventFlags & 0x20);

    return {
      progressIndicator,
      screenEventFlags,
      eventOverlayActive,
      phaseLabel: PHASE_LABELS[progressIndicator] ?? `unknown (${progressIndicator})`,
    };
  });

export { wasmGetProgressIndicator, wasmGetOverworldVariant };
export type { OverworldVariantInfo, GameProgressInfo };
