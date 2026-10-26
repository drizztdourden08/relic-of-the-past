/* @layer shared-game @kind logic */
import { buildPlayerYaml } from '@drizztdourden08/archipelia-client-kit';
import { AP_GAME } from '../ap-game';
import { fileOptionsOf } from './file-options-of';
import { gameBlock } from './game-block';
import { optionSchema } from './option-schema';
import { preRolledOfInput } from './pre-rolled-of-input';
import type { PlayerYamlInput } from './player-yaml.type';

const renderPlayerYaml = (input: PlayerYamlInput): string => {
  const { slotName, appVersion } = input;
  const fileInput = { ...input, options: fileOptionsOf(input) };
  return buildPlayerYaml({
    game: AP_GAME,
    slotName,
    description: appVersion ? `${AP_GAME} ${appVersion}` : AP_GAME,
    schema: optionSchema(),
    options: gameBlock(fileInput),
    preRolled: preRolledOfInput(fileInput),
  });
};

export { renderPlayerYaml };
