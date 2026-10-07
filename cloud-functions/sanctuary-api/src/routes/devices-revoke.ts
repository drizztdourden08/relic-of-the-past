/* @layer root-config @kind logic */
/** POST /devices/:id/revoke, session only. The device's token stops working
 *  on its next call; the row stays so the Account page can show when. */
import { SANCTUARY_ROUTES } from '../../../../shared/sanctuary';
import { notFound } from '../http/http-error';
import { requireSession } from '../auth/require-session';
import { devicesRepo } from '../db/devices-repo';
import type { Route } from '../route.type';

const devicesRevoke: Route = {
  ...SANCTUARY_ROUTES.devicesRevoke,
  handler: async ({ req, res, params }) => {
    const { userId } = await requireSession(req);
    const device = await devicesRepo.get(params.id);
    if (!device || device.userId !== userId) throw notFound('No such device.');
    if (!device.revokedAt) await devicesRepo.revoke(device.id);
    res.status(200).json({ ok: true });
  },
};

export { devicesRevoke };
