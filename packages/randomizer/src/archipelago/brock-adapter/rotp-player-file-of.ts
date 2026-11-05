/* @layer shared-game @kind logic */
import { playerFileOf, withDeathLink } from '@drizztdourden08/brock-randomizer/archipelago';
import { ACCESSIBILITY_KEY, accessibilityFromSnapshot } from '../../world/accessibility/accessibility-from-snapshot';
import { deliverableListsOf } from '../../world/fill/deliverable-lists';
import { AP_GAME } from '../ap-game';
import { preRolledOfSnapshot } from '../pre-rolled';
import { rotpOptionRows } from './rotp-option-rows';
import type { PlayerFile } from '@drizztdourden08/brock-randomizer/archipelago';
import type { RandomizerOptionsSnapshot } from '../../world/options.type';
import type { PlayerFileInput } from '../player-file/player-file.type';

const preRolledOf = (input: PlayerFileInput, options: RandomizerOptionsSnapshot): Record<string, unknown> | undefined => {
  if (input.seedText === undefined) return undefined;
  const sets = input.deliverable ?? {};
  return { ...preRolledOfSnapshot(input.seedText, options, sets), deliverable: deliverableListsOf(sets) };
};

const rotpPlayerFileOf = (input: PlayerFileInput): PlayerFile => {
  const options: RandomizerOptionsSnapshot = {
    ...input.options, values: withDeathLink(input.options.values, input.deathLink),
  };
  return playerFileOf({
    game: AP_GAME,
    slotName: input.slotName,
    appVersion: input.appVersion,
    schemaRows: rotpOptionRows(),
    values: options.values,
    seedText: input.seedText,
    preRolled: preRolledOf(input, options),
    block: (block) => {
      if (ACCESSIBILITY_KEY in block) block[ACCESSIBILITY_KEY] = accessibilityFromSnapshot(options);
      return block;
    },
  });
};

export { rotpPlayerFileOf };
