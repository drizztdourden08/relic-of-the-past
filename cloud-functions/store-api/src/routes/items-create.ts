/* @layer store-api @kind logic */
import { STORE_ROUTES } from '@rotp/hub-contracts';
import type { ItemCreateResponse } from '@rotp/hub-contracts';
import { itemCreateSchema } from '@rotp/hub-contracts';
import { tooMany } from '../../../hub-core/http/http-error';
import { parseBody } from '../../../hub-core/http/parse-body';
import { now } from '../../../hub-core/db/firestore';
import { rateLimitRepo } from '../../../hub-core/db/rate-limit-repo';
import type { Route } from '../../../hub-core/route.type';
import { personOf, requirePlayer } from '../auth/player';
import { itemsRepo } from '../db/items-repo';
import { DAY_MS } from '../db/daily-repo.constants';
import { newItem } from '../items/new-item';
import { CREATES_PER_DAY } from './items-create.constants';

const itemsCreate: Route = {
  ...STORE_ROUTES.itemsCreate,
  handler: async ({ req, res }) => {
    const player = await requirePlayer(req);
    const body = parseBody(itemCreateSchema, req.body);
    if (!(await rateLimitRepo.checkRateLimit(`store-create-${player.caller.userId}`, CREATES_PER_DAY, DAY_MS))) {
      throw tooMany('That is enough new listings for today.');
    }
    const item = newItem(itemsRepo.newId(),body, personOf(player), now());
    await itemsRepo.create(item);
    const response: ItemCreateResponse = { item };
    res.status(201).json(response);
  },
};

export { itemsCreate };
