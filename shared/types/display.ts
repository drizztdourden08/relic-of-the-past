/* @layer shared-types @kind types */

/** One selectable refresh rate on the display the window currently sits on. */
interface DisplayModeInfo {
  hz: number;
  /** True when this mode matches the display's current resolution, so switching to it
   *  changes only the refresh rate and leaves window layout alone. */
  sameResolution: boolean;
}

/**
 * What we know about the display's refresh rate, from two independent sources.
 *
 * `reportedHz` comes from the OS and is authoritative but unavailable on some hosts
 * (mobile WebView, plain web) and occasionally reported as 0 even on desktop.
 * `measuredHz` is derived from the spacing of vblank-aligned frame callbacks, which
 * works everywhere but needs a moment of sampling and carries a little noise.
 */
interface RefreshRateInfo {
  reportedHz: number | null;
  measuredHz: number | null;
  /** Modes the display offers, when the host can enumerate them. Empty when it cannot. */
  modes: DisplayModeInfo[];
}

/** Everything the synced-rate setting needs to describe itself honestly in the UI. */
interface SyncedRateStatus {
  /** False when this platform or session cannot change the rate at all. */
  supported: boolean;
  /** Plain-language reason, shown to the user when `supported` is false. */
  unsupportedReason: string;
  /** Multiples of 60 this display offers, which is what the target picker lists. */
  availableRates: number[];
  /** Rate in effect right now. */
  currentHz: number | null;
  /** Rate we switched to, or null when we have not changed anything. */
  activeHz: number | null;
  /** Highest evenly-dividing rate the display can manage. */
  bestHz: number | null;
  /** Why the most recent attempt failed, if it did. */
  lastError: string;
}

export type { DisplayModeInfo, RefreshRateInfo, SyncedRateStatus };
