/* @layer store-api @kind logic */
import { STORE_ROUTES } from '@rotp/hub-contracts';
import type { ItemsListResponse } from '@rotp/hub-contracts';
import { STORE_LIMITS } from '@rotp/hub-contracts';
import type { StoreKind } from '@rotp/hub-contracts';
import { badRequest } from '../../../hub-core/http/http-error';
import { queryParam } from '../../../hub-core/http/query';
import type { Route } from '../../../hub-core/route.type';
import { requirePlayer } from '../auth/player';
import { itemsRepo } from '../db/items-repo';
import { toCardView } from '../items/card-view';
import { signCards } from '../media/sign-media';
import { KINDS } from './items-list.constants';

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
