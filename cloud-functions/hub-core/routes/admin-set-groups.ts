/* @layer hub-core @kind logic */
import { HUB_ROUTES, setGroupsSchema } from '@rotp/hub-contracts';
import { badRequest, notFound } from '../http/http-error';
import { parseBody } from '../http/parse-body';
import { requireAdmin } from '../auth/require-admin';
import { refreshAccess } from '../access/refresh-access';
import { siteUserOf } from '../access/site-user';
import { groupsRepo } from '../db/groups-repo';
import { grantsRepo } from '../db/grants-repo';
import { usersRepo } from '../db/users-repo';
import { now } from '../db/firestore';
import type { SiteConfig } from '../site-config.type';
import type { Route } from '../route.type';

const liftRevoke = async (userId: string, by: string): Promise<void> => {
  const grant = await grantsRepo.get(userId);
  if (grant?.revoked) await grantsRepo.set({ userId, by, note: '', at: now(), revoked: false });
};

const adminSetGroups = (site: SiteConfig): Route => ({
  ...HUB_ROUTES.adminSetGroups,
  handler: async ({ req, res, params }) => {
    const admin = await requireAdmin(req, site);
    const { groupIds } = parseBody(setGroupsSchema, req.body);
    const user = await usersRepo.get(params.userId);
    if (!user) throw notFound('No such user.');
    const known = (await groupsRepo.all(site.defaultGroup)).map((group) => group.id);
    const unknown = groupIds.find((id) => !known.includes(id));
    if (unknown) throw badRequest(`No group "${unknown}".`);
    await usersRepo.setGroups(user.id, groupIds);
    if (groupIds.length > 0) await liftRevoke(user.id, admin.caller.userId);
    res.status(200).json({ user: siteUserOf(await refreshAccess(site, user.id, null), site) });
  },
});

export { adminSetGroups };
