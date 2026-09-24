/* @layer root-config @kind logic */
/** One caller shape for both credentials: a device Bearer token from the app
 *  or the session cookie from the site. A revoked device is no caller at all. */
import type { Request } from '@google-cloud/functions-framework';
import { unauthorized } from '../http/http-error';
import { devicesRepo } from '../db/devices-repo';
import { sha256 } from './device-token';
import { readSession } from './session';

type Caller = { userId: string; via: 'session' | 'device'; deviceId: string | null };

const bearerOf = (req: Request): string | null => {
  const header = req.headers.authorization;
  return header?.startsWith('Bearer ') ? header.slice('Bearer '.length).trim() : null;
};

const readCaller = async (req: Request): Promise<Caller | null> => {
  const bearer = bearerOf(req);
  if (bearer) {
    const device = await devicesRepo.byTokenHash(sha256(bearer));
    if (!device || device.revokedAt || device.code) return null;
    await devicesRepo.touch(device.id);
    return { userId: device.userId, via: 'device', deviceId: device.id };
  }
  const session = await readSession(req);
  return session ? { userId: session.userId, via: 'session', deviceId: null } : null;
};

const requireCaller = async (req: Request): Promise<Caller> => {
  const caller = await readCaller(req);
  if (!caller) throw unauthorized();
  return caller;
};

export { readCaller, requireCaller };
export type { Caller };
