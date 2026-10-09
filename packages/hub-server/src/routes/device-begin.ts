/* @layer hub-core @kind logic */
import { HUB_LIMITS, HUB_ROUTES, deviceBeginSchema } from '@rotp/hub-contracts';
import { parseBody } from '../http/parse-body';
import { newDeviceToken, newUserCode, sha256 } from '../auth/device-token';
import { devicesRepo } from '../db/devices-repo';
import type { DeviceDoc } from '../db/devices-repo.type';
import { collection, now } from '../db/firestore';
import type { SiteConfig } from '../site-config.type';
import type { Route } from '../route.type';

const deviceBegin = (site: SiteConfig): Route => ({
  ...HUB_ROUTES.deviceBegin,
  handler: async ({ req, res }) => {
    const { label, platform } = parseBody(deviceBeginSchema, req.body);
    const id = collection('devices').doc().id;
    const userCode = newUserCode();
    const pollSecret = newDeviceToken();
    const expiresAt = now() + HUB_LIMITS.deviceCodeTtlMs;
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
      verifyUrl: `${site.origin()}/device/${userCode}`,
      pollSecret,
      expiresAt,
      pollMs: HUB_LIMITS.devicePollMs,
    });
  },
});

export { deviceBegin };
