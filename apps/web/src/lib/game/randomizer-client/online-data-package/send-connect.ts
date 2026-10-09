/* @layer bridge-wasm @kind logic */
import { buildConnect, versionOf } from '../online-handshake';
import { clientUuid } from '../client-uuid';
import type { OnlineContext } from '../online-context.type';

const sendConnect = (ctx: OnlineContext): void => {
  const { config, room, game } = ctx;
  if (room.gameData === null) {
    ctx.fail(`[Online] Server data package has no entry for ${game}`);
    return;
  }
  const version = room.roomInfo ? versionOf(room.roomInfo) : undefined;
  ctx.send(buildConnect({
    game, slotName: config.slotName, uuid: clientUuid(), password: config.password, version, deathLink: config.deathLink,
  }));
};

export { sendConnect };
