/* @layer hub-core @kind logic */
/** GET /groups, admin only. Every group with how many people are in it and how
 *  many of those an admin added by hand. */
import { HUB_ROUTES } from '../../../shared/hub';
import type { Group, HubUser } from '../../../shared/hub';
import { requireAdmin } from '../auth/require-admin';
import { membershipOf } from '../access/membership';
import { groupsRepo } from '../db/groups-repo';
import { usersRepo } from '../db/users-repo';
import type { SiteConfig } from '../site-config.type';
import type { Route } from '../route.type';

type GroupWithCounts = Group & { memberCount: number; manualCount: number };

const withCounts = (group: Group, users: HubUser[]): GroupWithCounts => ({
  ...group,
  memberCount: users.filter((user) => membershipOf(user).includes(group.id)).length,
  manualCount: users.filter((user) => user.groupIds.includes(group.id)).length,
});

const groupsList = (site: SiteConfig): Route => ({
  ...HUB_ROUTES.groupsList,
  handler: async ({ req, res }) => {
    await requireAdmin(req, site);
    const [groups, users] = await Promise.all([groupsRepo.all(site.defaultGroup), usersRepo.listAll()]);
    res.status(200).json({ groups: groups.map((group) => withCounts(group, users)) });
  },
});

export { groupsList };
export type { GroupWithCounts };
