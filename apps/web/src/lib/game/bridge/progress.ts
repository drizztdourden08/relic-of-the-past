/* @layer bridge-wasm @kind logic */
/** Universal progress indicator + overworld variant state. */
import { progressTierLabel } from '@shared/game/logic/queries/progress-tier';
import { callWhenRunning } from './wasm-call';

interface OverworldVariantInfo {
  /** The progress indicator byte — see `progress-tier.ts` for what each value means. */
  progressIndicator: number;
  /** save_ow_event_info[screen] for the current screen */
  screenEventFlags: number;
  /** Whether the event overlay has been applied (bit 0x20) */
  eventOverlayActive: boolean;
  /** Human label for the current variant phase */
  phaseLabel: string;
}

interface GameProgressInfo {
  /** Raw progress indicator value (0-3) */
  tier: number;
  /** Human-readable phase label */
  label: string;
}

/** A tier the dataset has no row for is reported as itself, never renamed here. */
const phaseLabelFor = (tier: number): string => progressTierLabel(tier) ?? `unknown (${tier})`;

/**
 * Read the game's progress indicator from WRAM — works indoors or outdoors.
 * Returns null only when game is not running.
 */
const wasmGetProgressIndicator = (): GameProgressInfo | null =>
  callWhenRunning<GameProgressInfo | null>(null, (mod) => {
    const progPtr = mod.ccall('WasmGetProgressFlags', 'number', [], []) as number;
    if (!progPtr) return null;
    const tier = mod.HEAPU8[progPtr];
    return { tier, label: phaseLabelFor(tier) };
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
      phaseLabel: phaseLabelFor(progressIndicator),
    };
  });

export { wasmGetProgressIndicator, wasmGetOverworldVariant };
export type { OverworldVariantInfo, GameProgressInfo };
