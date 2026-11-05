/* @layer renderer-app @kind logic */
import { joinedRoll } from '@drizztdourden08/brock-randomizer';
import type { RandomizerProfileConfig, RollContext } from '@drizztdourden08/brock-randomizer';
import { joinFromForm } from '@app/game/archipelia';
import { rotpLobbyOfConnection } from '../lobby/rotp-lobby-of-connection';
import { withDeliverable } from '@app/views/GameSession/behavior/with-deliverable';
import { NO_LOBBY_ERROR } from '@app/views/DataManager/sub-components/profile-manager/build-randomizer-config/build-randomizer-config.constants';

const rollArchipelia = async (config: RandomizerProfileConfig, ctx: RollContext) => {
  const { lobby, lobbyCheck } = rotpLobbyOfConnection(ctx.connection);
  if (lobbyCheck.kind !== 'ok') throw new Error(NO_LOBBY_ERROR);
  Object.assign(config, withDeliverable({ name: '', romFile: '', randomizer: config }).randomizer);
  ctx.onProgress?.(0);
  const joined = await joinFromForm(lobbyCheck, config, lobby.seat, (fraction) => ctx.onProgress?.(fraction));
  if (!joined.ok) throw new Error(joined.error);
  return joinedRoll(joined);
};

export { rollArchipelia };
