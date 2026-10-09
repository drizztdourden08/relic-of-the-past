/* @layer hub-core @kind logic */
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
