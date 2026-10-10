/* @layer hub-core @kind logic */
import { HUB_ROUTES, patchGroupSchema } from '@rotp/hub-contracts';
import { notFound } from '../http/http-error';
import { parseBody } from '../http/parse-body';
import { requireAdmin } from '../auth/require-admin';
import { invalidateGroups } from '../access/cached-groups';
import { assertKnownRights } from '../access/check-rights';
import { groupsRepo } from '../db/groups-repo';
import { routeParam } from '../router';
import type { GroupPatch } from '../db/groups-repo.type';
import type { SiteConfig } from '../site-config.type';
import type { Route } from '../route.type';

const groupsPatch = (site: SiteConfig): Route => ({
  ...HUB_ROUTES.groupsPatch,
  handler: async ({ req, res, params }) => {
    await requireAdmin(req, site);
    const patch: GroupPatch = parseBody(patchGroupSchema, req.body);
    assertKnownRights(patch.rights, site.rights);
    const group = await groupsRepo.get(routeParam(params, 'id'));
    if (!group) throw notFound('No such group.');
    await groupsRepo.update(group.id, patch);
    invalidateGroups();
    res.status(200).json({ group: { ...group, ...patch } });
  },
});

export { groupsPatch };
