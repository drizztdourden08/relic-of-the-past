/* @layer hub-core @kind logic */
import { HUB_ROUTES, idSchema, putViewSchema } from '@rotp/hub-contracts';
import type { SavedView } from '@rotp/hub-contracts';
import { badRequest, notFound } from '../http/http-error';
import { parseBody } from '../http/parse-body';
import { requireCaller } from '../auth/require-caller';
import { viewsRepo } from '../db/views-repo';
import { now } from '../db/firestore';
import type { SiteConfig } from '../site-config.type';
import type { Route } from '../route.type';

const viewsPut = (site: SiteConfig): Route => ({
  ...HUB_ROUTES.viewsPut,
  handler: async ({ req, res, params }) => {
    const caller = await requireCaller(req);
    const id = idSchema.safeParse(params.id);
    if (!id.success) throw badRequest('Invalid view id.');
    const body = parseBody(putViewSchema, req.body);
    if (!site.viewSurfaces.includes(body.surface)) throw badRequest(`Invalid surface: pick ${site.viewSurfaces.join(' or ')}.`);
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
});

export { viewsPut };
