/* @layer store-api @kind logic */
/** POST /items { kind, name, summary, description, tags, license }. A draft listing owned by
 *  the caller; nothing is public until its first version is approved. */
import { STORE_ROUTES } from '../../../../shared/store/api-contract';
import type { ItemCreateResponse } from '../../../../shared/store/api-types';
import { itemCreateSchema } from '../../../../shared/store/schemas';
import { tooMany } from '../../../hub-core/http/http-error';
import { parseBody } from '../../../hub-core/http/parse-body';
import { now } from '../../../hub-core/db/firestore';
import { rateLimitRepo } from '../../../hub-core/db/rate-limit-repo';
import type { Route } from '../../../hub-core/route.type';
import { personOf, requirePlayer } from '../auth/player';
import { itemsRepo } from '../db/items-repo';
import { DAY_MS } from '../db/daily-repo';
import { newItem } from '../items/new-item';

/** New listings one player may start in a day. */
const CREATES_PER_DAY = 10;

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
