/* @layer electron-main @kind types */

/**
 * One platform's way of reading and changing the display's refresh rate.
 *
 * Every method is allowed to fail softly: `available` false means this platform has no
 * implementation at all, and an empty rate list or a false from `setRate` means the platform
 * has one but the display or compositor would not cooperate. The caller reports either state
 * to the user rather than pretending the setting worked.
 */
interface DisplayModeDriver {
  readonly platform: string;
  /** False when the binding could not load or this OS has no implementation. */
  readonly available: boolean;
  /** Why it is unavailable, for the UI to show. Empty when available. */
  readonly unavailableReason: string;
  /** Refresh rates offered at the CURRENT resolution, so switching changes only the rate. */
  listRates: () => number[];
  /** The rate in effect right now, or null if it cannot be read. */
  currentRate: () => number | null;
  /** Apply a rate. False when the platform refused it. */
  setRate: (hz: number) => boolean;
}

export type { DisplayModeDriver };
