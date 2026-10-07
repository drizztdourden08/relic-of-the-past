/* @layer hub-core @kind logic */
/** DELETE /groups/:id, admin only. Removes the group, takes its id off every
 *  person who held it, and runs their access chain again so someone left with
 *  no group drops back to pending. The default group stays. */
import { DEFAULT_GROUP_ID, HUB_ROUTES } from '../../../shared/hub';
import { conflict, notFound } from '../http/http-error';
import { requireAdmin } from '../auth/require-admin';
import { invalidateGroups } from '../access/cached-groups';
import { refreshAccess } from '../access/refresh-access';
import { groupsRepo } from '../db/groups-repo';
import { usersRepo } from '../db/users-repo';
import type { SiteConfig } from '../site-config.type';
import type { Route } from '../route.type';

const groupsDelete = (site: SiteConfig): Route => ({
  ...HUB_ROUTES.groupsDelete,
  handler: async ({ req, res, params }) => {
    await requireAdmin(req, site);
    if (params.id === DEFAULT_GROUP_ID) throw conflict('The default group cannot be deleted.');
    const group = await groupsRepo.get(params.id);
    if (!group) throw notFound('No such group.');
    await groupsRepo.remove(group.id);
    invalidateGroups();
    const touched = await usersRepo.removeGroup(group.id);
    await Promise.all(touched.map((userId) => refreshAccess(site, userId, null)));
    res.status(200).json({ ok: true });
  },
});

export { groupsDelete };
