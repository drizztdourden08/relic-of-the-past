/* @layer renderer-other @kind logic */
/**
 * Bridge to the Android FrameRate plugin.
 *
 * Asks the platform for a refresh rate that divides evenly into the game's 60 frames a second.
 * Android decides whether to honour it, so nothing here reports the display as definitely
 * changed — only what was requested and what the display says it is doing.
 */
import { registerPlugin } from '@capacitor/core';

interface FrameRateResult {
  applied: boolean;
  reason: string;
  targetHz?: number;
  sdkInt: number;
}

interface DisplayInfoResult {
  currentHz: number;
  /** Comma-separated, as Capacitor bridges float arrays poorly. */
  supportedHz: string;
}

interface FrameRatePluginApi {
  setGameFrameRate: () => Promise<FrameRateResult>;
  getDisplayInfo: () => Promise<DisplayInfoResult>;
}

const FrameRatePlugin = registerPlugin<FrameRatePluginApi>('FrameRate');

/** Parse the bridged rate list, dropping anything unusable. */
const parseSupportedHz = (raw: string): number[] => raw
  .split(',')
  .map((part) => Number.parseFloat(part))
  .filter((hz) => Number.isFinite(hz) && hz > 0)
  .sort((a, b) => a - b);

export { FrameRatePlugin, parseSupportedHz };
export type { FrameRateResult, DisplayInfoResult, FrameRatePluginApi };
