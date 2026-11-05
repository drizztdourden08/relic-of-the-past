/* @layer renderer-app @kind logic */
import { DEATH_LINK_KEY } from '@rotp/randomizer';
import type { RandomizerProfileConfig } from '@drizztdourden08/brock-randomizer';
import { rotpLobbyOf } from '../lobby/rotp-lobby-of';

const archipeliaFieldsOf = (
  optionValues: Readonly<Record<string, unknown>>, wizardValues: Readonly<Record<string, unknown>> | undefined,
): Partial<RandomizerProfileConfig> => {
  const slotName = rotpLobbyOf(wizardValues).lobby.slotName.trim();
  return {
    deathLink: optionValues[DEATH_LINK_KEY] === true,
    trackOtherPlayers: true,
    ...(slotName === '' ? {} : { slotName }),
  };
};

export { archipeliaFieldsOf };
