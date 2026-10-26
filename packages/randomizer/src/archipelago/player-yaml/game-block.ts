/* @layer shared-game @kind logic */
import { ACCESSIBILITY_KEY, accessibilityFromSnapshot } from '../../world/accessibility/accessibility-from-snapshot';
import { DEFAULT_PROGRESSION_BALANCING, GENERATOR_OWNED_KEYS } from './player-yaml.constants';
import type { PlayerYamlInput } from './player-yaml.type';

const gameBlock = (input: PlayerYamlInput): Record<string, unknown> => {
  const { options, seedText } = input;
  const block: Record<string, unknown> = { ...options.values };
  for (const key of GENERATOR_OWNED_KEYS) delete block[key];
  if (!('progression_balancing' in block)) block.progression_balancing = DEFAULT_PROGRESSION_BALANCING;
  if (ACCESSIBILITY_KEY in block) block[ACCESSIBILITY_KEY] = accessibilityFromSnapshot(options);
  if (seedText !== undefined) block.seed_text = seedText;
  return block;
};

export { gameBlock };
