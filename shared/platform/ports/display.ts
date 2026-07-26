/* @layer shared-platform @kind logic */
/**
 * Display port — what the host can tell us about the screen's refresh rate.
 *
 * Deliberately read-only. Every host can answer this (desktop from the OS, mobile and web from
 * the renderer's own frame-timing measurement), so the port stays fulfillable everywhere.
 * Changing the rate is a separate concern and needs native code per OS, so it is not here.
 */
import type { RefreshRateInfo } from '../../types/display';

interface DisplayPort {
  /** What the host knows. Hosts that know nothing return nulls rather than guessing. */
  getRefreshRate: () => Promise<RefreshRateInfo>;
}

export type { DisplayPort };
