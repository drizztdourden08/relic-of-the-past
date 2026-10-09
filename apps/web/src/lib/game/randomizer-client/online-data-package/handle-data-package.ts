/* @layer bridge-wasm @kind logic */
import { writeCachedGame } from '../data-package-cache';
import type { ApDataPackagePacket } from '../ap-protocol.type';
import type { OnlineContext } from '../online-context.type';
import { adoptGames } from './adopt-games';
import { sendConnect } from './send-connect';

const handleDataPackage = (ctx: OnlineContext, packet: ApDataPackagePacket): void => {
  const games = packet.data?.games ?? {};
  for (const [game, data] of Object.entries(games)) writeCachedGame(game, data);
  adoptGames(ctx, games);
  sendConnect(ctx);
};

export { handleDataPackage };
