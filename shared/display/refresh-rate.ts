/* @layer shared-game @kind logic */
/**
 * Refresh-rate arithmetic, shared by the main process and the renderer. The core advances 60
 * times a second, so a display whose rate is a whole multiple of 60 shows every frame for an
 * equal span. 144 Hz is the common offender: 144/60 is 2.4, so frames alternate between two and
 * three refreshes, which reads as stutter during scrolling. 60, 120 and 240 divide evenly.
 */

import type { RefreshRateInfo } from '../types/display';

/** Frames per second the core runs at (NTSC). */
const GAME_HZ = 60.0988;

/** Rates are reported and measured loosely (59.94, 119.88, 143.98), so compare with slack. */
const HZ_TOLERANCE = 1.5;

/** A measurement is only trustworthy once it has settled; below this, prefer the OS value. */
const MIN_MEASURED_HZ = 20;

/**
 * The rate to reason about. A settled measurement wins over the OS value: it is the cadence
 * frames are presented at, and it stays correct where the OS reports nothing or 0.
 */
const effectiveHz = (info: RefreshRateInfo | null): number | null => {
  if (!info) return null;
  if (info.measuredHz !== null && info.measuredHz >= MIN_MEASURED_HZ) return info.measuredHz;
  if (info.reportedHz !== null && info.reportedHz > 0) return info.reportedHz;
  return null;
};

/** Nearest whole multiple of 60, e.g. 143.98 -> 2 (as a multiple count). */
const nearestMultiple = (hz: number): number => Math.max(1, Math.round(hz / 60));

/** True when the display holds every game frame for an equal number of refreshes. */
const isSyncedRate = (hz: number | null): boolean => {
  if (hz === null || hz <= 0) return false;
  return Math.abs(hz - nearestMultiple(hz) * 60) <= HZ_TOLERANCE;
};

/**
 * Multiples of 60 at or below the display's rate, ascending: 144 Hz yields [60, 120], 240 Hz
 * yields [60, 120, 180, 240]. Used for the advisory and the target picker.
 */
const syncedRateOptions = (hz: number | null): number[] => {
  if (hz === null || hz <= 0) return [];
  // Round up by the tolerance first, so a 119.88 reading still offers 120.
  const ceiling = Math.floor((hz + HZ_TOLERANCE) / 60);
  return Array.from({ length: Math.max(0, ceiling) }, (_, i) => (i + 1) * 60);
};

/** Highest evenly-dividing rate the display can do, or null if it cannot manage even 60. */
const bestSyncedRate = (hz: number | null): number | null => {
  const options = syncedRateOptions(hz);
  return options.length ? options[options.length - 1] : null;
};

/**
 * Rates worth offering as a switch target, preferring what the host enumerated. The arithmetic
 * fallback keeps the picker useful where modes cannot be listed, at the cost of possibly
 * offering a rate the display turns down (the switch itself reports that).
 */
const targetRateOptions = (info: RefreshRateInfo | null): number[] => {
  const enumerated = (info?.modes ?? [])
    .filter((m) => m.sameResolution && isSyncedRate(m.hz))
    .map((m) => nearestMultiple(m.hz) * 60);
  if (enumerated.length) return [...new Set(enumerated)].sort((a, b) => a - b);
  return syncedRateOptions(effectiveHz(info));
};

export {
  GAME_HZ,
  HZ_TOLERANCE,
  bestSyncedRate,
  effectiveHz,
  isSyncedRate,
  nearestMultiple,
  syncedRateOptions,
  targetRateOptions,
};
