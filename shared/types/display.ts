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

export type { DisplayModeInfo, RefreshRateInfo };
