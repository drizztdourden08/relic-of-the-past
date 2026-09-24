/* @layer root-config @kind logic */
/** PUT /admin/users/:userId/groups { groupIds }, admin only. Replaces the
 *  person's manual groups and runs their access chain again without a provider
 *  token, so their role groups stay as last read. Giving a revoked person any
 *  group lifts the revoke; an empty list leaves it in place. */
import { SANCTUARY_ROUTES, setGroupsSchema } from '../../../../shared/sanctuary';
import { badRequest, notFound } from '../http/http-error';
import { parseBody } from '../http/parse-body';
import { requireAdmin } from '../auth/require-admin';
import { refreshAccess } from '../access/refresh-access';
import { groupsRepo } from '../db/groups-repo';
import { grantsRepo } from '../db/grants-repo';
import { usersRepo } from '../db/users-repo';
import { now } from '../db/firestore';
import type { Route } from '../route.type';

const liftRevoke = async (userId: string, by: string): Promise<void> => {
  const grant = await grantsRepo.get(userId);
  if (grant?.revoked) await grantsRepo.set({ userId, by, note: '', at: now(), revoked: false });
};

const adminSetGroups: Route = {
  ...SANCTUARY_ROUTES.adminSetGroups,
  handler: async ({ req, res, params }) => {
    const admin = await requireAdmin(req);
    const { groupIds } = parseBody(setGroupsSchema, req.body);
    const user = await usersRepo.get(params.userId);
    if (!user) throw notFound('No such user.');
    const known = (await groupsRepo.all()).map((group) => group.id);
    const unknown = groupIds.find((id) => !known.includes(id));
    if (unknown) throw badRequest(`No group "${unknown}".`);
    await usersRepo.setGroups(user.id, groupIds);
    if (groupIds.length > 0) await liftRevoke(user.id, admin.caller.userId);
    res.status(200).json({ user: await refreshAccess(user.id, null) });
  },
};

export { adminSetGroups };
