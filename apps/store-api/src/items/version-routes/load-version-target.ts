/* @layer store-api @kind logic */
import { requirePlayer } from '../../auth/player';
import { loadVisibleItem } from '../item-guards';
import { actorsOf } from '../project-item';
import { loadVersion } from '../versions';
import type { VersionRouteContext, VersionTarget } from './version-routes.type';

const loadVersionTarget = async ({ req, params }: VersionRouteContext): Promise<VersionTarget> => {
  const player = await requirePlayer(req);
  const item = await loadVisibleItem(params.id, player);
  return { player, item, actors: actorsOf(item, player), n: loadVersion(item, params.n).n };
};

export { loadVersionTarget };
