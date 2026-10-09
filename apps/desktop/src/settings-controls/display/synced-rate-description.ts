/* @layer renderer-components @kind logic */
import type { SyncedRateStatus } from '@shared/types/display';

const syncedRateDescription = (status: SyncedRateStatus): string => {
  if (!status.supported) {
    return `Switch the display to a refresh rate that divides evenly into the game's 60 frames a second while in fullscreen. Unavailable here: ${status.unsupportedReason}.`;
  }
  const base = 'While in fullscreen, switch the display to a refresh rate that divides evenly into the 60 frames a second the game runs at, and put your original rate back when you leave fullscreen or quit. Only the refresh rate changes; the resolution is left alone.';
  if (!status.availableRates.length) {
    return `${base} This display does not offer any rate that is a multiple of 60, so there is nothing to switch to.`;
  }
  return status.lastError ? `${base} Last attempt failed: ${status.lastError}.` : base;
};

export { syncedRateDescription };
