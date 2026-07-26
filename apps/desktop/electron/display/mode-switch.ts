/* @layer electron-main @kind logic */
/**
 * Applies a synced refresh rate for the duration of fullscreen, and puts the original back.
 *
 * Driven from the main process rather than the renderer, because the restore has to survive
 * things the renderer never hears about: the window being closed, the app quitting, or the
 * process dying. A player left on a rate they did not choose, with no idea what changed it,
 * is a worse bug than the judder this fixes.
 *
 * Only ever changes the rate while genuinely in fullscreen. Windowed mode is composited by the
 * desktop anyway, so a switch there would disturb every other window for no benefit.
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
 * A display commonly reports both the NTSC variant and the exact rate — Windows lists 59 and
 * 60, 119 and 120 (it rounds, so those are 59.94 and 119.88). Both pass the tolerance check,
 * but they are not equally good: the game runs at 60.0988, so 60 tracks it and 59.94 slips a
 * frame every few seconds. Collapse each group to one label and remember the closest match, so
 * the picker offers "60 Hz" once and the driver is asked for the rate that actually is 60.
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
  // The rate to actually request, which may differ from the label — see syncedRateMap.
  const exactRate = syncedRateMap().get(target);
  if (exactRate === undefined) {
    lastError = `this display no longer offers ${target} Hz`;
    return;
  }

  const current = driver.currentRate();
  // Already exactly there: nothing to change, and so nothing owed on the way out. Compared
  // against the exact rate rather than the label, so sitting on 59.94 still moves to 60.
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
  // Turning it off mid-session should hand the display back immediately rather than wait
  // for the player to leave fullscreen.
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
 * Change the rate and keep it — the explicit "Change refresh rate" action, as opposed to the
 * fullscreen switch. Nothing is recorded for restoring, because the player asked for this to
 * stick; undoing it means choosing another rate here or in the OS display settings.
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
