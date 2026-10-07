/* @layer root-config @kind logic */
/** GET /admin/pending. Every user with the identities that name them; the
 *  site groups them into pending, members and revoked. */
import { SANCTUARY_ROUTES } from '../../../../shared/sanctuary';
import { requireAdmin } from '../auth/require-admin';
import { usersRepo } from '../db/users-repo';
import { identitiesRepo } from '../db/identities-repo';
import type { Route } from '../route.type';

const adminPending: Route = {
  ...SANCTUARY_ROUTES.adminPending,
  handler: async ({ req, res }) => {
    await requireAdmin(req);
    const all = await usersRepo.listAll();
    const users = await Promise.all(all.map(async (user) => ({ user, identities: await identitiesRepo.forUser(user.id) })));
    res.status(200).json({ users });
  },
};

export { adminPending };
