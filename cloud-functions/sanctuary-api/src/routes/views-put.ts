/* @layer root-config @kind logic */
/** PUT /me/views/:id. Creates or replaces one saved view. The id is the
 *  client's, so a view can be saved before the server has seen it; a view id
 *  already owned by someone else is refused as absent. */
import { SANCTUARY_ROUTES, idSchema, putViewSchema } from '../../../../shared/sanctuary';
import type { SavedView } from '../../../../shared/sanctuary';
import { badRequest, notFound } from '../http/http-error';
import { parseBody } from '../http/parse-body';
import { requireCaller } from '../auth/require-caller';
import { viewsRepo } from '../db/views-repo';
import { now } from '../db/firestore';
import type { Route } from '../route.type';

const viewsPut: Route = {
  ...SANCTUARY_ROUTES.viewsPut,
  handler: async ({ req, res, params }) => {
    const caller = await requireCaller(req);
    const id = idSchema.safeParse(params.id);
    if (!id.success) throw badRequest('Invalid view id.');
    const body = parseBody(putViewSchema, req.body);
    const existing = await viewsRepo.get(id.data);
    if (existing && existing.userId !== caller.userId) throw notFound('No such view.');
    const view: SavedView = {
      id: id.data,
      userId: caller.userId,
      surface: body.surface,
      name: body.name,
      snapshot: body.snapshot ?? null,
      updatedAt: now(),
    };
    await viewsRepo.put(view);
    res.status(200).json(view);
  },
};

export { viewsPut };
