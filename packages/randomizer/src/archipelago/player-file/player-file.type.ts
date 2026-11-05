/* @layer shared-game @kind types */
import type { DeliverableSets } from '../../world/fill/fill-options-from-snapshot';
import type { RandomizerOptionsSnapshot } from '../../world/options.type';

interface PlayerFileInput {
  slotName?: string;
  options: RandomizerOptionsSnapshot;
  seedText?: string;
  appVersion?: string;
  preRolled?: Record<string, unknown>;
  deliverable?: DeliverableSets;
  deathLink?: boolean;
}

export type { PlayerFileInput };
