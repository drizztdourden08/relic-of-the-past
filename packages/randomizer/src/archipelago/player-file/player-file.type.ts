/* @layer shared-game @kind types */
import type { DeliverableSets } from '../../world/fill/fill-options-from-snapshot';
import type { RandomizerOptionsSnapshot } from '../../world/options.type';

interface PlayerFileInput {
  slotName?: string;
  options: RandomizerOptionsSnapshot;
  seedText?: string;
  appVersion?: string;
  deliverable?: DeliverableSets;
  deathLink?: boolean;
}

interface PlayerFile {
  slotName: string;
  yaml: string;
}

export type { PlayerFile, PlayerFileInput };
