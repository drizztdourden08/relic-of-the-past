/* @layer shared-game @kind types */
import type { DeliverableSets } from '../../world/fill/fill-options-from-snapshot';
import type { RandomizerOptionsSnapshot } from '../../world/options.type';

interface PlayerYamlInput {
  slotName: string;
  options: RandomizerOptionsSnapshot;
  appVersion?: string;
  seedText?: string;
  preRolled?: Record<string, unknown>;
  deliverable?: DeliverableSets;
  deathLink?: boolean;
}

export type { PlayerYamlInput };
