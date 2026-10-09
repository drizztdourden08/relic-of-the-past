/* @layer hub-core @kind logic */
import { HUB_ROUTES } from '@rotp/hub-contracts';
import { requireSession } from '../auth/require-session';
import { devicesRepo } from '../db/devices-repo';
import type { Route } from '../route.type';

const devicesList: Route = {
  ...HUB_ROUTES.devicesList,
  handler: async ({ req, res }) => {
    const { userId } = await requireSession(req);
    const devices = (await devicesRepo.listForUser(userId)).map(({ tokenHash: _hash, ...device }) => device);
    res.status(200).json({ devices });
  },
};

export { devicesList };
