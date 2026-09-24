/* @layer root-config @kind logic */
/** POST /device/confirm { userCode }, session only. The signed-in user
 *  approves a pending code and the device becomes theirs. Refused after
 *  expiry or a second use, since a used code is no longer pending. */
import { SANCTUARY_ROUTES, deviceConfirmSchema } from '../../../../shared/sanctuary';
import { notFound } from '../http/http-error';
import { parseBody } from '../http/parse-body';
import { requireSession } from '../auth/require-session';
import { devicesRepo } from '../db/devices-repo';
import { now } from '../db/firestore';
import type { Route } from '../route.type';

const deviceConfirm: Route = {
  ...SANCTUARY_ROUTES.deviceConfirm,
  handler: async ({ req, res }) => {
    const { userId } = await requireSession(req);
    const { userCode } = parseBody(deviceConfirmSchema, req.body);
    const device = await devicesRepo.byUserCode(userCode);
    if (!device || !device.code || device.code.expiresAt < now()) throw notFound('That code is not waiting. Start again in the app.');
    await devicesRepo.confirm(device.id, userId, device.label);
    res.status(200).json({ device: { id: device.id, label: device.label, platform: device.platform } });
  },
};

export { deviceConfirm };
