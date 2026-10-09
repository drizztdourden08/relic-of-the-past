/* @layer store-api @kind logic */
import type { Request } from '@google-cloud/functions-framework';
import { hasRight } from '@rotp/hub-contracts';
import type { StorePermission } from '@rotp/hub-contracts';
import { notFound } from '../../../../hub-core/http/http-error';
import type { Player } from './player.type';
import { requirePlayer } from './require-player';

const requirePermission = async (req: Request, permission: StorePermission): Promise<Player> => {
  const player = await requirePlayer(req);
  if (!hasRight(player.rights, permission)) throw notFound();
  return player;
};

export { requirePermission };
