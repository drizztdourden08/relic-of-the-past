/* @layer root-config @kind logic */
/** GET /devices, session only. The Account page's signed-in devices, without
 *  the token hashes. */
import { SANCTUARY_ROUTES } from '../../../../shared/sanctuary';
import { requireSession } from '../auth/require-session';
import { devicesRepo } from '../db/devices-repo';
import type { Route } from '../route.type';

const devicesList: Route = {
  ...SANCTUARY_ROUTES.devicesList,
  handler: async ({ req, res }) => {
    const { userId } = await requireSession(req);
    const devices = (await devicesRepo.listForUser(userId)).map(({ tokenHash: _hash, ...device }) => device);
    res.status(200).json({ devices });
  },
};

export { devicesList };
