/* @layer hub-core @kind logic */
/** POST /admin/revoke/:userId { note }. Flips the grant row to revoked, which
 *  outranks every rule but the admin list, clears the person's manual groups,
 *  and bumps the session version so their open browsers drop out too. */
import { HUB_ROUTES, adminRevokeSchema } from '../../../shared/hub';
import { conflict, notFound } from '../http/http-error';
import { parseBody } from '../http/parse-body';
import { requireAdmin } from '../auth/require-admin';
import { refreshAccess } from '../access/refresh-access';
import { grantsRepo } from '../db/grants-repo';
import { usersRepo } from '../db/users-repo';
import { now } from '../db/firestore';
import type { SiteConfig } from '../site-config.type';
import type { Route } from '../route.type';

const adminRevoke = (site: SiteConfig): Route => ({
  ...HUB_ROUTES.adminRevoke,
  handler: async ({ req, res, params }) => {
    const admin = await requireAdmin(req, site);
    const { note } = parseBody(adminRevokeSchema, req.body);
    const user = await usersRepo.get(params.userId);
    if (!user) throw notFound('No such user.');
    if (user.id === admin.caller.userId) throw conflict('An admin cannot revoke their own access.');
    await grantsRepo.set({ userId: user.id, by: admin.caller.userId, note, at: now(), revoked: true });
    await usersRepo.setGroups(user.id, []);
    const refreshed = await refreshAccess(site, user.id, null);
    await usersRepo.bumpSessionVersion(user.id);
    res.status(200).json({ userId: user.id, access: refreshed.sites[site.id] ?? null });
  },
});

export { adminRevoke };
