/* @layer root-config @kind logic */
/** POST /admin/grant/:userId { note }. Records who granted and when, then runs
 *  the chain so the user's access state reflects it at once. */
import { SANCTUARY_ROUTES, adminGrantSchema } from '../../../../shared/sanctuary';
import { notFound } from '../http/http-error';
import { parseBody } from '../http/parse-body';
import { requireAdmin } from '../auth/require-admin';
import { evaluateAccess } from '../access/evaluate-access';
import { grantsRepo } from '../db/grants-repo';
import { usersRepo } from '../db/users-repo';
import { now } from '../db/firestore';
import type { Route } from '../route.type';

const adminGrant: Route = {
  ...SANCTUARY_ROUTES.adminGrant,
  handler: async ({ req, res, params }) => {
    const admin = await requireAdmin(req);
    const { note } = parseBody(adminGrantSchema, req.body);
    const user = await usersRepo.get(params.userId);
    if (!user) throw notFound('No such user.');
    await grantsRepo.set({ userId: user.id, by: admin.caller.userId, note, at: now(), revoked: false });
    const access = await evaluateAccess(user.id, null);
    await usersRepo.setAccess(user.id, access);
    res.status(200).json({ userId: user.id, access });
  },
};

export { adminGrant };
