/* @layer root-config @kind logic */
/** GET /groups, admin only. Every group with how many people are in it and how
 *  many of those an admin added by hand. */
import { SANCTUARY_ROUTES } from '../../../../shared/sanctuary';
import type { Group, SanctuaryUser } from '../../../../shared/sanctuary';
import { requireAdmin } from '../auth/require-admin';
import { membershipOf } from '../access/membership';
import { groupsRepo } from '../db/groups-repo';
import { usersRepo } from '../db/users-repo';
import type { Route } from '../route.type';

type GroupWithCounts = Group & { memberCount: number; manualCount: number };

const withCounts = (group: Group, users: SanctuaryUser[]): GroupWithCounts => ({
  ...group,
  memberCount: users.filter((user) => membershipOf(user).includes(group.id)).length,
  manualCount: users.filter((user) => user.groupIds.includes(group.id)).length,
});

const groupsList: Route = {
  ...SANCTUARY_ROUTES.groupsList,
  handler: async ({ req, res }) => {
    await requireAdmin(req);
    const [groups, users] = await Promise.all([groupsRepo.all(), usersRepo.listAll()]);
    res.status(200).json({ groups: groups.map((group) => withCounts(group, users)) });
  },
};

export { groupsList };
export type { GroupWithCounts };
