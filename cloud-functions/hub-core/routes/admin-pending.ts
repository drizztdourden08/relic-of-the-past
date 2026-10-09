/* @layer hub-core @kind logic */
import { HUB_ROUTES } from '@rotp/hub-contracts';
import { requireAdmin } from '../auth/require-admin';
import { siteUserOf } from '../access/site-user';
import { usersRepo } from '../db/users-repo';
import { identitiesRepo } from '../db/identities-repo';
import type { SiteConfig } from '../site-config.type';
import type { Route } from '../route.type';

const adminPending = (site: SiteConfig): Route => ({
  ...HUB_ROUTES.adminPending,
  handler: async ({ req, res }) => {
    await requireAdmin(req, site);
    const listed = await usersRepo.listForSite(site.id);
    const users = await Promise.all(
      listed.map(async (user) => ({ user: siteUserOf(user, site), identities: await identitiesRepo.forUser(user.id) })),
    );
    res.status(200).json({ users });
  },
});

export { adminPending };
