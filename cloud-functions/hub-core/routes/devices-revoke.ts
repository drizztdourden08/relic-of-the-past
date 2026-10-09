/* @layer hub-core @kind logic */
import { HUB_ROUTES } from '../../../shared/hub';
import { notFound } from '../http/http-error';
import { requireSession } from '../auth/require-session';
import { devicesRepo } from '../db/devices-repo';
import type { Route } from '../route.type';

const devicesRevoke: Route = {
  ...HUB_ROUTES.devicesRevoke,
  handler: async ({ req, res, params }) => {
    const { userId } = await requireSession(req);
    const device = await devicesRepo.get(params.id);
    if (!device || device.userId !== userId) throw notFound('No such device.');
    if (!device.revokedAt) await devicesRepo.revoke(device.id);
    res.status(200).json({ ok: true });
  },
};

export { devicesRevoke };
