/* @layer hub-core @kind logic */
import { DEFAULT_GROUP_ID, HUB_ROUTES } from '@rotp/hub-contracts';
import { conflict, notFound } from '../http/http-error';
import { requireAdmin } from '../auth/require-admin';
import { invalidateGroups } from '../access/cached-groups';
import { refreshAccess } from '../access/refresh-access';
import { groupsRepo } from '../db/groups-repo';
import { usersRepo } from '../db/users-repo';
import { routeParam } from '../router';
import type { SiteConfig } from '../site-config.type';
import type { Route } from '../route.type';

const groupsDelete = (site: SiteConfig): Route => ({
  ...HUB_ROUTES.groupsDelete,
  handler: async ({ req, res, params }) => {
    await requireAdmin(req, site);
    if (params.id === DEFAULT_GROUP_ID) throw conflict('The default group cannot be deleted.');
    const group = await groupsRepo.get(routeParam(params, 'id'));
    if (!group) throw notFound('No such group.');
    await groupsRepo.remove(group.id);
    invalidateGroups();
    const touched = await usersRepo.removeGroup(group.id);
    await Promise.all(touched.map((userId) => refreshAccess(site, userId, null)));
    res.status(200).json({ ok: true });
  },
});

export { groupsDelete };
