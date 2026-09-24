/* @layer root-config @kind logic */
/** DELETE /me/views/:id. Removes one of the caller's saved views. */
import { SANCTUARY_ROUTES } from '../../../../shared/sanctuary';
import { notFound } from '../http/http-error';
import { requireCaller } from '../auth/require-caller';
import { viewsRepo } from '../db/views-repo';
import type { Route } from '../route.type';

const viewsDelete: Route = {
  ...SANCTUARY_ROUTES.viewsDelete,
  handler: async ({ req, res, params }) => {
    const caller = await requireCaller(req);
    const view = await viewsRepo.get(params.id);
    if (!view || view.userId !== caller.userId) throw notFound('No such view.');
    await viewsRepo.remove(view.id);
    res.status(200).json({ ok: true });
  },
};

export { viewsDelete };
