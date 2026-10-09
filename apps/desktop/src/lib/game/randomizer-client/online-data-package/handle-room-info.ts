/* @layer bridge-wasm @kind logic */
import { log } from '../../../log-bus';
import { buildGetDataPackage } from '../online-handshake';
import { splitByCache } from '../data-package-cache';
import { roomHashOf } from '../room-hash';
import type { ApRoomInfoPacket } from '../ap-protocol.type';
import type { OnlineContext } from '../online-context.type';
import { adoptGames } from './adopt-games';
import { sendConnect } from './send-connect';

const handleRoomInfo = (ctx: OnlineContext, packet: ApRoomInfoPacket): void => {
  ctx.room.roomInfo = packet;
  if (typeof packet.seed_name === 'string' && packet.seed_name !== '') ctx.room.roomHash = roomHashOf(packet.seed_name);
  const games = [...(Array.isArray(packet.games) ? packet.games : []), ctx.game];
  const { cached, missing } = splitByCache(games, packet.datapackage_checksums);
  adoptGames(ctx, cached);
  if (missing.length === 0) {
    sendConnect(ctx);
    return;
  }
  log.randomizer(`[Online] Fetching data package for ${missing.length} game(s)`);
  ctx.send(buildGetDataPackage(missing));
};

export { handleRoomInfo };
