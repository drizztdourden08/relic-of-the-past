/* @layer store-api @kind logic */
import type { Request } from '@google-cloud/functions-framework';
import { hasRight } from '../../../../../shared/hub/rights';
import type { StorePermission } from '../../../../../shared/store/store-permissions';
import { notFound } from '../../../../hub-core/http/http-error';
import type { Player } from './player.type';
import { requirePlayer } from './require-player';

const requirePermission = async (req: Request, permission: StorePermission): Promise<Player> => {
  const player = await requirePlayer(req);
  if (!hasRight(player.rights, permission)) throw notFound();
  return player;
};

export { requirePermission };
