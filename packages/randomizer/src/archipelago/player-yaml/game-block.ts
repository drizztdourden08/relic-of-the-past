/* @layer shared-game @kind logic */
import { concreteOptionValues } from '../concrete-option-values';
import { ACCESSIBILITY_KEY, accessibilityFromSnapshot } from '../../world/accessibility/accessibility-from-snapshot';
import { DEFAULT_PROGRESSION_BALANCING, GENERATOR_OWNED_KEYS } from './player-yaml.constants';
import { preRolledOfInput } from './pre-rolled-of-input';
import type { PlayerYamlInput } from './player-yaml.type';

/** The game's options block: the snapshot key for key, with the generator-facing spellings. */
const gameBlock = (input: PlayerYamlInput): Record<string, unknown> => {
  const { options, seedText } = input;
  const block = concreteOptionValues({ ...options.values });
  for (const key of GENERATOR_OWNED_KEYS) delete block[key];
  if (!('progression_balancing' in block)) block.progression_balancing = DEFAULT_PROGRESSION_BALANCING;
  if (ACCESSIBILITY_KEY in block) block[ACCESSIBILITY_KEY] = accessibilityFromSnapshot(options);
  if (seedText !== undefined) block.seed_text = seedText;
  const preRolled = preRolledOfInput(input);
  if (preRolled !== undefined) block.pre_rolled = preRolled;
  return block;
};

export { gameBlock };
