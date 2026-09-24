/* @layer root-config @kind logic */
/** POST /device/begin { label, platform }, no auth. Mints the user code the
 *  app shows and the poll secret only the app knows; the row belongs to nobody
 *  until a signed-in user confirms the code on the site. */
import { LIMITS, SANCTUARY_ROUTES, deviceBeginSchema } from '../../../../shared/sanctuary';
import { readEnv } from '../env';
import { parseBody } from '../http/parse-body';
import { newDeviceToken, newUserCode, sha256 } from '../auth/device-token';
import { devicesRepo } from '../db/devices-repo';
import type { DeviceDoc } from '../db/devices-repo';
import { collection, now } from '../db/firestore';
import type { Route } from '../route.type';

const deviceBegin: Route = {
  ...SANCTUARY_ROUTES.deviceBegin,
  handler: async ({ req, res }) => {
    const { label, platform } = parseBody(deviceBeginSchema, req.body);
    const id = collection('devices').doc().id;
    const userCode = newUserCode();
    const pollSecret = newDeviceToken();
    const expiresAt = now() + LIMITS.deviceCodeTtlMs;
    const doc: DeviceDoc = {
      id,
      userId: '',
      tokenHash: '',
      label,
      platform,
      createdAt: now(),
      lastSeenAt: now(),
      revokedAt: null,
      code: { userCode, pollSecretHash: sha256(pollSecret), expiresAt, status: 'pending' },
    };
    await devicesRepo.create(doc);
    res.status(201).json({
      deviceId: id,
      userCode,
      verifyUrl: `${readEnv().SANCTUARY_ORIGIN}/device/${userCode}`,
      pollSecret,
      expiresAt,
      pollMs: LIMITS.devicePollMs,
    });
  },
};

export { deviceBegin };
