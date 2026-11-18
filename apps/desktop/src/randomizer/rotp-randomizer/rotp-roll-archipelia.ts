/* @layer renderer-app @kind logic */
import { joinedRoll } from '@drizztdourden08/brock-randomizer';
import type { RandomizerProfileConfig, RollContext } from '@drizztdourden08/brock-randomizer';
import { joinFromForm } from '@drizztdourden08/brock-randomizer/renderer';
import { rotpLobbyOfConnection } from '../lobby/rotp-lobby-of-connection';
import { withDeliverable } from '@app/views/GameSession/behavior/with-deliverable';
import { LocalizedError } from '@app/storage/localized-error';
import { NO_LOBBY_MESSAGE } from '@app/views/DataManager/sub-components/profile-manager/build-randomizer-config/build-randomizer-config.constants';

const rollArchipelia = async (config: RandomizerProfileConfig, ctx: RollContext) => {
  const { lobby, lobbyCheck } = rotpLobbyOfConnection(ctx.connection);
  if (lobbyCheck.kind !== 'ok') throw new LocalizedError(NO_LOBBY_MESSAGE);
  Object.assign(config, withDeliverable({ name: '', romFile: '', randomizer: config }).randomizer);
  ctx.onProgress?.(0);
  const joined = await joinFromForm(lobbyCheck, config, {
    wanted: lobby.seat,
    onProgress: (fraction) => ctx.onProgress?.(fraction),
  });
  if (!joined.ok) throw new Error(joined.error);
  return joinedRoll(joined);
};

export { rollArchipelia };
