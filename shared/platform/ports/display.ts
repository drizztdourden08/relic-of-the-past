/* @layer shared-platform @kind logic */
/**
 * What the host can tell us about the screen's refresh rate. Deliberately read-only: every host
 * can answer (desktop from the OS, mobile and web from frame-timing measurement). Changing the
 * rate needs native code per OS, so it is not here.
 */
import type { RefreshRateInfo, SyncedRateStatus } from '../../types/display';

const UNSUPPORTED_SYNCED_RATE: SyncedRateStatus = {
  supported: false,
  unsupportedReason: 'changing the refresh rate is only possible in the desktop app',
  availableRates: [],
  currentHz: null,
  activeHz: null,
  bestHz: null,
  lastError: '',
};

interface DisplayPort {
  /** What the host knows. Hosts that know nothing return nulls, never guesses. */
  getRefreshRate: () => Promise<RefreshRateInfo>;
  /** Whether a rate switch is possible here, and what it would offer. */
  getSyncedRateStatus: () => Promise<SyncedRateStatus>;
  /** Store the preference. The host applies it on fullscreen transitions, not here. */
  setSyncedRatePreference: (enabled: boolean, targetHz: number) => Promise<SyncedRateStatus>;
  /** Change the rate and keep it. Undone only by choosing another rate, here or in the OS. */
  applyRefreshRate: (hz: number) => Promise<SyncedRateStatus>;
}

export { UNSUPPORTED_SYNCED_RATE };
export type { DisplayPort };
