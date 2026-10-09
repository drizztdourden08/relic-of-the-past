/* @layer hub-core @kind logic */
import { HUB_ROUTES, devicePollSchema } from '@rotp/hub-contracts';
import { forbidden, notFound } from '../http/http-error';
import { parseBody } from '../http/parse-body';
import { newDeviceToken, sha256 } from '../auth/device-token';
import { devicesRepo } from '../db/devices-repo';
import { now } from '../db/firestore';
import type { Route } from '../route.type';
import type { PollStatus } from './device-poll.type';

const devicePoll: Route = {
  ...HUB_ROUTES.devicePoll,
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
export type { PollStatus } from './device-poll.type';
