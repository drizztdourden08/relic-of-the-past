/* @layer electron-main @kind logic */
/**
 * Applies a synced refresh rate for the duration of fullscreen, and puts the original back.
 *
 * Driven from the main process, not the renderer, because the restore has to survive the
 * window closing, the app quitting, or the process dying. A player stranded on a rate they
 * did not choose is a worse bug than the judder this fixes.
 *
 * Only changes the rate in fullscreen. Windowed mode is composited by the desktop anyway.
 */
import { bestSyncedRate, isSyncedRate, nearestMultiple } from '@shared/display/refresh-rate';
import { getDisplayModeDriver } from './native';
import type { SyncedRateStatus } from '@shared/types/display';

interface Preference {
  enabled: boolean;
  /** Desired rate, or 0 for "the highest multiple of 60 this display offers". */
  targetHz: number;
}

let preference: Preference = { enabled: false, targetHz: 0 };
/** The rate in effect before we touched anything. Non-null means a restore is owed. */
let rateToRestore: number | null = null;
let lastError = '';

/**
 * Multiple-of-60 label to the actual rate to request for it.
 *
 * A display often reports both the NTSC variant and the exact rate (Windows lists 59 and 60,
 * 119 and 120). Both pass the tolerance check, but the game runs at 60.0988, so 59.94 slips
 * a frame every few seconds. Each group collapses to one label with the closest match.
 */
const syncedRateMap = (): Map<number, number> => {
  const map = new Map<number, number>();
  for (const hz of getDisplayModeDriver().listRates()) {
    if (!isSyncedRate(hz)) continue;
    const label = nearestMultiple(hz) * 60;
    const best = map.get(label);
    if (best === undefined || Math.abs(hz - label) < Math.abs(best - label)) map.set(label, hz);
  }
  return map;
};

/** Labels to offer in the picker, ascending. */
const availableSyncedRates = (): number[] => [...syncedRateMap().keys()].sort((a, b) => a - b);

/** The label the preference resolves to right now. 0 means "highest available". */
const resolveTarget = (): number | null => {
  const options = availableSyncedRates();
  if (!options.length) return null;
  if (preference.targetHz > 0) {
    return options.includes(preference.targetHz) ? preference.targetHz : null;
  }
  return options[options.length - 1];
};

const restore = (): void => {
  if (rateToRestore === null) return;
  const target = rateToRestore;
  // Cleared first, so a failing driver cannot leave us retrying forever on every event.
  rateToRestore = null;
  getDisplayModeDriver().setRate(target);
};

const applyForFullscreen = (): void => {
  const driver = getDisplayModeDriver();
  lastError = '';
  if (!preference.enabled || !driver.available) return;

  const target = resolveTarget();
  if (target === null) {
    lastError = 'this display does not offer a refresh rate that is a multiple of 60';
    return;
  }
  // May differ from the label, see syncedRateMap.
  const exactRate = syncedRateMap().get(target);
  if (exactRate === undefined) {
    lastError = `this display no longer offers ${target} Hz`;
    return;
  }

  const current = driver.currentRate();
  // Compared against the exact rate, not the label, so sitting on 59.94 still moves to 60.
  if (current === exactRate) return;

  if (!driver.setRate(exactRate)) {
    lastError = `the system refused to switch this display to ${target} Hz`;
    return;
  }
  // Only now is a restore owed, and only to where we actually came from.
  if (rateToRestore === null && current !== null) rateToRestore = current;
};

/** Called on every fullscreen transition. Leaving fullscreen always restores. */
const onFullscreenChange = (isFullscreen: boolean): void => {
  if (isFullscreen) applyForFullscreen();
  else restore();
};

const setPreference = (next: Preference): void => {
  const wasEnabled = preference.enabled;
  preference = next;
  // Turning it off mid-session hands the display back immediately.
  if (wasEnabled && !next.enabled) restore();
};

const readStatus = (): SyncedRateStatus => {
  const driver = getDisplayModeDriver();
  return {
    supported: driver.available,
    unsupportedReason: driver.unavailableReason,
    availableRates: driver.available ? availableSyncedRates() : [],
    currentHz: driver.currentRate(),
    activeHz: rateToRestore !== null ? resolveTarget() : null,
    bestHz: bestSyncedRate(driver.currentRate()),
    lastError,
  };
};

/** Last-ditch restore for app shutdown, so a quit from fullscreen cannot strand the display. */
const restoreOnShutdown = (): void => restore();

/**
 * The explicit "Change refresh rate" action. Nothing is recorded for restoring: the player
 * asked for this to stick.
 */
const applyPermanently = (hz: number): SyncedRateStatus => {
  const driver = getDisplayModeDriver();
  lastError = '';
  if (!driver.available) {
    lastError = driver.unavailableReason;
    return readStatus();
  }
  const exactRate = syncedRateMap().get(hz);
  if (exactRate === undefined) {
    lastError = `this display does not offer ${hz} Hz`;
    return readStatus();
  }
  if (!driver.setRate(exactRate)) {
    lastError = `the system refused to switch this display to ${hz} Hz`;
    return readStatus();
  }
  // A pending fullscreen restore would drag the display back off the rate just chosen, so it
  // is dropped: this new rate is now the one to come back to.
  rateToRestore = null;
  return readStatus();
};

export { onFullscreenChange, setPreference, readStatus, restoreOnShutdown, availableSyncedRates, applyPermanently };
export type { Preference };
