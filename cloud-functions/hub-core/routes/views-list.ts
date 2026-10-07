/* @layer hub-core @kind logic */
/** GET /me/views?surface. The caller's saved views for one of this site's surfaces, by name. */
import { HUB_ROUTES } from '../../../shared/hub';
import { badRequest } from '../http/http-error';
import { queryParam } from '../http/query';
import { requireCaller } from '../auth/require-caller';
import { viewsRepo } from '../db/views-repo';
import type { SiteConfig } from '../site-config.type';
import type { Route } from '../route.type';

const viewsList = (site: SiteConfig): Route => ({
  ...HUB_ROUTES.viewsList,
  handler: async ({ req, res }) => {
    const caller = await requireCaller(req);
    const surface = queryParam(req, 'surface');
    if (!surface || !site.viewSurfaces.includes(surface)) {
      throw badRequest(`Pick a surface: ${site.viewSurfaces.join(' or ')}.`);
    }
    res.status(200).json({ views: await viewsRepo.list(caller.userId, surface) });
  },
});

export { viewsList };
