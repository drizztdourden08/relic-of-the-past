/* @layer shared-game @kind logic */
/**
 * The player file an Archipelago host generates a multiworld from: who the
 * slot is, which game it plays, and that game's options block.
 *
 * The options block is the profile's frozen snapshot, key for key, so the
 * world package reads the exact values the profile was created with.
 * Progression balancing is added when the snapshot has no row of its own for
 * it, and an accessibility row is written in the spelling the generator reads.
 * `death_link` is the profile's DeathLink toggle, in the block and in the
 * pre-roll alike, and a choice valued `random` is written as its id
 * (concrete-option-values.ts), since the generator reads that word as a roll.
 *
 * A file with a seed text also carries the profile's pre-rolled values and its
 * whole world model under `pre_rolled` (pre-rolled.ts), rolled from that seed
 * exactly as a local seed rolls them, unless the caller hands its own. The
 * deliverable spots that world was built with ride along as lists, so slot
 * data hands the client the same sets back.
 */
import { AP_GAME } from './ap-game';
import { emitYaml } from './yaml-emit';
import { concreteOptionValues } from './concrete-option-values';
import { preRolledOfSnapshot } from './pre-rolled';
import { deliverableListsOf } from '../world/fill/deliverable-lists';
import { ACCESSIBILITY_KEY, accessibilityFromSnapshot } from '../world/accessibility/accessibility-from-snapshot';
import type { DeliverableSets } from '../world/fill/fill-options-from-snapshot';
import type { RandomizerOptionsSnapshot } from '../world/options.type';

/** The balancing Archipelago applies when a player file does not ask for another. */
const DEFAULT_PROGRESSION_BALANCING = 50;

/**
 * Catalog rows whose names Archipelago's generator reads as its own on every world, so the
 * file leaves them out; the package declares neither (integrations/archipelago options.py).
 */
const GENERATOR_OWNED_KEYS: readonly string[] = ['plando_connections', 'start_inventory_from_pool'];

interface PlayerYamlInput {
  slotName: string;
  options: RandomizerOptionsSnapshot;
  /** The app version named in the description; omitted, the description names the game alone. */
  appVersion?: string;
  /** The profile's seed text, carried so the world package can roll the same seed. */
  seedText?: string;
  /**
   * Values the app has already rolled from the seed (pond demands, shop
   * prices, capacity ladders), written as nested YAML under `pre_rolled` so
   * the world package places against the same numbers the app shows. Any
   * JSON-shaped value is accepted: objects, arrays and scalars.
   */
  preRolled?: Record<string, unknown>;
  /** The spots the app proved deliverable; absent, every scope spot stays locked vanilla. */
  deliverable?: DeliverableSets;
  /** The profile's DeathLink toggle, the one source of `death_link`; absent, the snapshot's value stands. */
  deathLink?: boolean;
}

const DEATH_LINK_KEY = 'death_link';

/** The snapshot the file is written from: the profile's DeathLink toggle over the frozen row. */
const fileOptionsOf = (input: PlayerYamlInput): RandomizerOptionsSnapshot => {
  const { options, deathLink } = input;
  if (deathLink === undefined) return options;
  return { ...options, values: { ...options.values, [DEATH_LINK_KEY]: deathLink } };
};

/** The caller's own values, or the ones the seed text rolls; none without either. */
const preRolledOf = (input: PlayerYamlInput): Record<string, unknown> | undefined => {
  const { options, seedText, preRolled, deliverable } = input;
  if (preRolled !== undefined) return preRolled;
  if (seedText === undefined) return undefined;
  const sets = deliverable ?? {};
  return { ...preRolledOfSnapshot(seedText, options, sets), deliverable: deliverableListsOf(sets) };
};

const gameBlock = (input: PlayerYamlInput): Record<string, unknown> => {
  const { options, seedText } = input;
  const block = concreteOptionValues({ ...options.values });
  for (const key of GENERATOR_OWNED_KEYS) delete block[key];
  if (!('progression_balancing' in block)) block.progression_balancing = DEFAULT_PROGRESSION_BALANCING;
  if (ACCESSIBILITY_KEY in block) block[ACCESSIBILITY_KEY] = accessibilityFromSnapshot(options);
  if (seedText !== undefined) block.seed_text = seedText;
  const preRolled = preRolledOf(input);
  if (preRolled !== undefined) block.pre_rolled = preRolled;
  return block;
};

const renderPlayerYaml = (input: PlayerYamlInput): string => {
  const { slotName, appVersion } = input;
  return emitYaml({
    name: slotName,
    description: appVersion ? `${AP_GAME} ${appVersion}` : AP_GAME,
    game: AP_GAME,
    [AP_GAME]: gameBlock({ ...input, options: fileOptionsOf(input) }),
  });
};

export { renderPlayerYaml };
export type { PlayerYamlInput };
