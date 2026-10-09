/* @layer store-api @kind logic */
import { STORE_ROUTES } from '@rotp/hub-contracts';
import type { BanResponse } from '@rotp/hub-contracts';
import type { SiteAccess } from '@rotp/hub-contracts';
import { conflict, notFound } from '@rotp/hub-server';
import { now } from '@rotp/hub-server';
import { usersRepo } from '@rotp/hub-server';
import { identitiesRepo } from '@rotp/hub-server';
import { readHubEnv } from '@rotp/hub-server';
import type { Route } from '@rotp/hub-server';
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
