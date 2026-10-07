/* @layer root-config @kind logic */
/** PATCH /groups/:id, admin only. Name, linked Discord role and rights. A new
 *  role link reaches people at their next sign-in or re-check. */
import { SANCTUARY_ROUTES, patchGroupSchema } from '../../../../shared/sanctuary';
import { notFound } from '../http/http-error';
import { parseBody } from '../http/parse-body';
import { requireAdmin } from '../auth/require-admin';
import { invalidateGroups } from '../access/cached-groups';
import { groupsRepo } from '../db/groups-repo';
import type { GroupPatch } from '../db/groups-repo';
import type { Route } from '../route.type';

/** Firestore refuses undefined values; an absent field is left as it is. */
const definedOnly = (patch: GroupPatch): GroupPatch =>
  Object.fromEntries(Object.entries(patch).filter(([, value]) => value !== undefined)) as GroupPatch;

const groupsPatch: Route = {
  ...SANCTUARY_ROUTES.groupsPatch,
  handler: async ({ req, res, params }) => {
    await requireAdmin(req);
    const patch = definedOnly(parseBody(patchGroupSchema, req.body));
    const group = await groupsRepo.get(params.id);
    if (!group) throw notFound('No such group.');
    await groupsRepo.update(group.id, patch);
    invalidateGroups();
    res.status(200).json({ group: { ...group, ...patch } });
  },
};

export { groupsPatch };
