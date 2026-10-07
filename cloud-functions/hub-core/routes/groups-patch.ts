/* @layer hub-core @kind logic */
/** PATCH /groups/:id, admin only. Name, linked Discord role and rights. A new
 *  role link reaches people at their next sign-in or re-check. */
import { HUB_ROUTES, patchGroupSchema } from '../../../shared/hub';
import { notFound } from '../http/http-error';
import { parseBody } from '../http/parse-body';
import { requireAdmin } from '../auth/require-admin';
import { invalidateGroups } from '../access/cached-groups';
import { assertKnownRights } from '../access/check-rights';
import { groupsRepo } from '../db/groups-repo';
import type { GroupPatch } from '../db/groups-repo';
import type { SiteConfig } from '../site-config.type';
import type { Route } from '../route.type';

/** Firestore refuses undefined values; an absent field is left as it is. */
const definedOnly = (patch: GroupPatch): GroupPatch =>
  Object.fromEntries(Object.entries(patch).filter(([, value]) => value !== undefined)) as GroupPatch;

const groupsPatch = (site: SiteConfig): Route => ({
  ...HUB_ROUTES.groupsPatch,
  handler: async ({ req, res, params }) => {
    await requireAdmin(req, site);
    const patch = definedOnly(parseBody(patchGroupSchema, req.body));
    assertKnownRights(patch.rights, site.rights);
    const group = await groupsRepo.get(params.id);
    if (!group) throw notFound('No such group.');
    await groupsRepo.update(group.id, patch);
    invalidateGroups();
    res.status(200).json({ group: { ...group, ...patch } });
  },
});

export { groupsPatch };
