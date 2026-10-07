/* @layer store-api @kind logic */
/** GET /items?kind&cursor. Published items as cards, newest first, in pages of
 *  STORE_LIMITS.itemsPageSize. Search, sort and filters run in the browser. */
import { STORE_ROUTES } from '../../../../shared/store/api-contract';
import type { ItemsListResponse } from '../../../../shared/store/api-types';
import { STORE_LIMITS } from '../../../../shared/store/limits';
import type { StoreKind } from '../../../../shared/store/types';
import { badRequest } from '../../../hub-core/http/http-error';
import { queryParam } from '../../../hub-core/http/query';
import type { Route } from '../../../hub-core/route.type';
import { requirePlayer } from '../auth/player';
import { itemsRepo } from '../db/items-repo';
import { toCardView } from '../items/card-view';
import { signCards } from '../media/sign-media';

const KINDS: readonly StoreKind[] = ['music', 'character', 'language'];

const kindOf = (raw: string | undefined): StoreKind | null => {
  if (raw === undefined) return null;
  if (!KINDS.includes(raw as StoreKind)) throw badRequest('Unknown kind.');
  return raw as StoreKind;
};

const itemsList: Route = {
  ...STORE_ROUTES.itemsList,
  handler: async ({ req, res }) => {
    await requirePlayer(req);
    const page = await itemsRepo.listPublished(kindOf(queryParam(req, 'kind')), queryParam(req, 'cursor'), STORE_LIMITS.itemsPageSize);
    const body: ItemsListResponse = { items: await signCards(page.items.map(toCardView)), nextCursor: page.nextCursor };
    res.status(200).json(body);
  },
};

export { itemsList };
