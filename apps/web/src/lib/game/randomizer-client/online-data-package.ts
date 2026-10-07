/* @layer bridge-wasm @kind logic */
/**
 * RoomInfo and DataPackage: learn every game in the room, from the cache when its checksum
 * is already held and from the server otherwise, then ask for the slot. The tables of every
 * game are kept, not only this one's, so a message naming another world's item reads as a
 * name (print-json.ts).
 */
import { log } from '../../log-bus';
import { buildConnect, buildGetDataPackage, versionOf } from './online-handshake';
import { clientUuid } from './client-uuid';
import { splitByCache, writeCachedGame } from './data-package-cache';
import { roomHashOf } from './room-hash';
import type { ApDataPackagePacket, ApGameData, ApRoomInfoPacket } from './ap-protocol.type';
import type { OnlineContext } from './online-context.type';

const adoptGames = (ctx: OnlineContext, games: Record<string, ApGameData>): void => {
  const { names, room, game } = ctx;
  names.addGames(games);
  const own = games[game];
  if (own === undefined) return;
  room.gameData = own;
  room.itemNameById = new Map(Object.entries(own.item_name_to_id).map(([name, id]) => [id, name]));
};

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

const handleDataPackage = (ctx: OnlineContext, packet: ApDataPackagePacket): void => {
  const games = packet.data?.games ?? {};
  for (const [game, data] of Object.entries(games)) writeCachedGame(game, data);
  adoptGames(ctx, games);
  sendConnect(ctx);
};

export { handleDataPackage, handleRoomInfo };
