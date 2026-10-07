/* @layer store-api @kind logic */
/** POST /users/:userId/ban. An admin bans a player from the store: their store record turns
 *  revoked, which every store route refuses and every later sign-in keeps, and their
 *  published items are unlisted. Their Sanctuary access is untouched. An admin is never
 *  banned, and never bans themselves. */
import { STORE_ROUTES } from '../../../../shared/store/api-contract';
import type { BanResponse } from '../../../../shared/store/api-types';
import type { SiteAccess } from '../../../../shared/hub/site-types';
import { conflict, notFound } from '../../../hub-core/http/http-error';
import { now } from '../../../hub-core/db/firestore';
import { usersRepo } from '../../../hub-core/db/users-repo';
import { identitiesRepo } from '../../../hub-core/db/identities-repo';
import { readHubEnv } from '../../../hub-core/env';
import type { Route } from '../../../hub-core/route.type';
import { requireStoreAdmin } from '../auth/player';
import { itemsRepo } from '../db/items-repo';
import { invalidateHome } from '../home/home-cache';

const usersBan: Route = {
  ...STORE_ROUTES.usersBan,
  handler: async ({ req, res, params }) => {
    const admin = await requireStoreAdmin(req);
    const user = await usersRepo.get(params.userId);
    if (!user) throw notFound('No such user.');
    if (user.id === admin.caller.userId) throw conflict('An admin cannot ban themselves.');
    const current = user.sites.store;
    const admins = readHubEnv().SANCTUARY_ADMIN_IDS;
    const listed = (await identitiesRepo.forUser(user.id)).some((identity) => admins.includes(identity.id));
    if (listed || current?.state === 'admin') throw conflict('An admin cannot be banned.');

    const at = now();
    const banned: SiteAccess = { state: 'revoked', source: 'manual-grant', checkedAt: at, firstSeenAt: current?.firstSeenAt ?? at };
    await usersRepo.saveSiteAccess(user.id, 'store', banned, user.roleGroupIds);
    const published = (await itemsRepo.byAuthor(user.id)).filter((item) => item.status === 'published');
    await Promise.all(published.map((item) => itemsRepo.setStatus(item.id, 'unlisted')));
    invalidateHome();
    const body: BanResponse = { userId: user.id, unlisted: published.length };
    res.status(200).json(body);
  },
};

export { usersBan };
