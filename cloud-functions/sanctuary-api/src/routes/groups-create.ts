/* @layer root-config @kind logic */
/** POST /groups, admin only. The id is made from the name and never changes,
 *  so a rename keeps every membership. */
import { SANCTUARY_ROUTES, createGroupSchema } from '../../../../shared/sanctuary';
import type { Group } from '../../../../shared/sanctuary';
import { parseBody } from '../http/parse-body';
import { requireAdmin } from '../auth/require-admin';
import { invalidateGroups } from '../access/cached-groups';
import { uniqueSlug } from '../groups/group-slug';
import { groupsRepo } from '../db/groups-repo';
import { now } from '../db/firestore';
import type { Route } from '../route.type';

const groupsCreate: Route = {
  ...SANCTUARY_ROUTES.groupsCreate,
  handler: async ({ req, res }) => {
    await requireAdmin(req);
    const body = parseBody(createGroupSchema, req.body);
    const taken = (await groupsRepo.all()).map((group) => group.id);
    const group: Group = {
      id: uniqueSlug(body.name, taken),
      name: body.name,
      discordRoleId: body.discordRoleId,
      rights: body.rights,
      createdAt: now(),
    };
    await groupsRepo.create(group);
    invalidateGroups();
    res.status(201).json({ group });
  },
};

export { groupsCreate };
