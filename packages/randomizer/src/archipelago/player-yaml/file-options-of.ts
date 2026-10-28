/* @layer shared-game @kind logic */
import { DEATH_LINK_KEY } from './player-yaml.constants';
import type { RandomizerOptionsSnapshot } from '../../world/options.type';
import type { PlayerYamlInput } from './player-yaml.type';

const fileOptionsOf = (input: PlayerYamlInput): RandomizerOptionsSnapshot => {
  const { options, deathLink } = input;
  if (deathLink === undefined) return options;
  return { ...options, values: { ...options.values, [DEATH_LINK_KEY]: deathLink } };
};

export { fileOptionsOf };
