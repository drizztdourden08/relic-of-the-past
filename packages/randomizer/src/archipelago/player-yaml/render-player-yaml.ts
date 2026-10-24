/* @layer shared-game @kind logic */
/**
 * The player file an Archipelago host generates a multiworld from: who the slot is, which game
 * it plays, and that game's options block.
 *
 * The options block is the profile's frozen snapshot, key for key, so the world package reads
 * the exact values the profile was created with. Progression balancing is added when the
 * snapshot has no row of its own for it, and an accessibility row is written in the spelling the
 * generator reads. `death_link` is the profile's DeathLink toggle, in the block and in the
 * pre-roll alike, and a choice valued `random` is written as its id (concrete-option-values.ts),
 * since the generator reads that word as a roll.
 *
 * A file with a seed text also carries the profile's pre-rolled values and its whole world model
 * under `pre_rolled` (pre-rolled), rolled from that seed exactly as a local seed rolls them,
 * unless the caller hands its own. The deliverable spots that world was built with ride along as
 * lists, so slot data hands the client the same sets back.
 */
import { AP_GAME } from '../ap-game';
import { emitYaml } from '../yaml-emit';
import { fileOptionsOf } from './file-options-of';
import { gameBlock } from './game-block';
import type { PlayerYamlInput } from './player-yaml.type';

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
