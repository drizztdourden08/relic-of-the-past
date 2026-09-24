/* @layer root-config @kind logic */
/** POST /device/poll { deviceId, pollSecret }, no auth. Pending until the code
 *  is confirmed, then the Bearer token exactly once: the token is minted on the
 *  delivering poll and only its hash stays. A second poll finds a closed
 *  handshake and gets `used`. */
import { SANCTUARY_ROUTES, devicePollSchema } from '../../../../shared/sanctuary';
import { forbidden, notFound } from '../http/http-error';
import { parseBody } from '../http/parse-body';
import { newDeviceToken, sha256 } from '../auth/device-token';
import { devicesRepo } from '../db/devices-repo';
import { now } from '../db/firestore';
import type { Route } from '../route.type';

type PollStatus = 'pending' | 'confirmed' | 'denied' | 'expired' | 'used';

const devicePoll: Route = {
  ...SANCTUARY_ROUTES.devicePoll,
  handler: async ({ req, res }) => {
    const { deviceId, pollSecret } = parseBody(devicePollSchema, req.body);
    const device = await devicesRepo.get(deviceId);
    if (!device) throw notFound('No such device.');
    if (!device.code) { res.status(200).json({ status: 'used' satisfies PollStatus }); return; }
    if (device.code.pollSecretHash !== sha256(pollSecret)) throw forbidden('This handshake is not yours.');
    if (device.code.status === 'denied') { res.status(200).json({ status: 'denied' satisfies PollStatus }); return; }
    if (device.code.expiresAt < now()) {
      await devicesRepo.remove(device.id);
      res.status(200).json({ status: 'expired' satisfies PollStatus });
      return;
    }
    if (device.code.status === 'pending') { res.status(200).json({ status: 'pending' satisfies PollStatus }); return; }
    const token = newDeviceToken();
    await devicesRepo.deliverToken(device.id, sha256(token));
    res.status(200).json({ status: 'confirmed' satisfies PollStatus, token, deviceId: device.id, label: device.label });
  },
};

export { devicePoll };
export type { PollStatus };
