/* @layer bridge-wasm @kind logic */
import type { ApGameData } from '../ap-protocol.type';
import type { OnlineContext } from '../online-context.type';

const adoptGames = (ctx: OnlineContext, games: Record<string, ApGameData>): void => {
  const { names, room, game } = ctx;
  names.addGames(games);
  const own = games[game];
  if (own === undefined) return;
  room.gameData = own;
  room.itemNameById = new Map(Object.entries(own.item_name_to_id).map(([name, id]) => [id, name]));
};

export { adoptGames };
