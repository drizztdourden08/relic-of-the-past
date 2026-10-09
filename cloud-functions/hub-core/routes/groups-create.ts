/* @layer hub-core @kind logic */
import { HUB_ROUTES, createGroupSchema } from '@rotp/hub-contracts';
import type { Group } from '@rotp/hub-contracts';
import { parseBody } from '../http/parse-body';
import { requireAdmin } from '../auth/require-admin';
import { invalidateGroups } from '../access/cached-groups';
import { assertKnownRights } from '../access/check-rights';
import { uniqueSlug } from '../groups/group-slug';
import { groupsRepo } from '../db/groups-repo';
import { now } from '../db/firestore';
import type { SiteConfig } from '../site-config.type';
import type { Route } from '../route.type';

const groupsCreate = (site: SiteConfig): Route => ({
  ...HUB_ROUTES.groupsCreate,
  handler: async ({ req, res }) => {
    await requireAdmin(req, site);
    const body = parseBody(createGroupSchema, req.body);
    assertKnownRights(body.rights, site.rights);
    const taken = (await groupsRepo.all(site.defaultGroup)).map((group) => group.id);
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
});

export { groupsCreate };
