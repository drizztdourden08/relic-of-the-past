/* @layer renderer-app @kind logic */
import { DEATH_LINK_KEY } from '@rotp/randomizer';
import type { RandomizerProfileConfig } from '@drizztdourden08/brock-randomizer';
import { CONNECTION_SLICE } from '@drizztdourden08/brock-randomizer/renderer';
import { rotpLobbyOfConnection } from '../lobby/rotp-lobby-of-connection';

const archipeliaFieldsOf = (
  optionValues: Readonly<Record<string, unknown>>, wizardValues: Readonly<Record<string, unknown>> | undefined,
): Partial<RandomizerProfileConfig> => {
  const slotName = rotpLobbyOfConnection(wizardValues?.[CONNECTION_SLICE] as Record<string, unknown> | undefined).lobby.slotName.trim();
  return {
    deathLink: optionValues[DEATH_LINK_KEY] === true,
    trackOtherPlayers: true,
    ...(slotName === '' ? {} : { slotName }),
  };
};

export { archipeliaFieldsOf };
