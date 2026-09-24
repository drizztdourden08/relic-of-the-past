/* @layer root-config @kind logic */
/** GET /me/views?surface. The caller's saved views for one surface, by name. */
import { SANCTUARY_ROUTES, viewSurfaceSchema } from '../../../../shared/sanctuary';
import { badRequest } from '../http/http-error';
import { queryParam } from '../http/query';
import { requireCaller } from '../auth/require-caller';
import { viewsRepo } from '../db/views-repo';
import type { Route } from '../route.type';

const viewsList: Route = {
  ...SANCTUARY_ROUTES.viewsList,
  handler: async ({ req, res }) => {
    const caller = await requireCaller(req);
    const surface = viewSurfaceSchema.safeParse(queryParam(req, 'surface'));
    if (!surface.success) throw badRequest('Pick a surface: files or reports.');
    res.status(200).json({ views: await viewsRepo.list(caller.userId, surface.data) });
  },
};

export { viewsList };
