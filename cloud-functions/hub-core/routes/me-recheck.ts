/* @layer hub-core @kind logic */
/** POST /me/recheck. Decides the caller's access to this site again without a provider
 *  token, so a new manual group or a new collaborator status shows up on demand. Discord
 *  roles need the Discord flow itself, which the site starts as a link. */
import { HUB_ROUTES } from '../../../shared/hub';
import { requireCaller } from '../auth/require-caller';
import { refreshAccess } from '../access/refresh-access';
import type { SiteConfig } from '../site-config.type';
import type { Route } from '../route.type';

const meRecheck = (site: SiteConfig): Route => ({
  ...HUB_ROUTES.meRecheck,
  handler: async ({ req, res }) => {
    const caller = await requireCaller(req);
    const user = await refreshAccess(site, caller.userId, null);
    res.status(200).json({ access: user.sites[site.id] ?? null });
  },
});

export { meRecheck };
