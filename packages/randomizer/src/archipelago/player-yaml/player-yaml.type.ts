/* @layer shared-game @kind types */
import type { DeliverableSets } from '../../world/fill/fill-options-from-snapshot';
import type { RandomizerOptionsSnapshot } from '../../world/options.type';

interface PlayerYamlInput {
  slotName: string;
  options: RandomizerOptionsSnapshot;
  /** The app version named in the description; omitted, the description names the game alone. */
  appVersion?: string;
  /** The profile's seed text, carried so the world package can roll the same seed. */
  seedText?: string;
  /**
   * Values the app has already rolled from the seed (pond demands, shop prices, capacity
   * ladders), written as nested YAML under `pre_rolled` so the world package places against the
   * same numbers the app shows. Any JSON-shaped value is accepted.
   */
  preRolled?: Record<string, unknown>;
  /** The spots the app proved deliverable; absent, every scope spot stays locked vanilla. */
  deliverable?: DeliverableSets;
  /** The profile's DeathLink toggle, the one source of `death_link`; absent, the snapshot's value stands. */
  deathLink?: boolean;
}

export type { PlayerYamlInput };
