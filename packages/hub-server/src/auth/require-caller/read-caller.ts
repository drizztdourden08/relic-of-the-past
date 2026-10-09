/* @layer hub-core @kind logic */
import type { Request } from '@google-cloud/functions-framework';
import { devicesRepo } from '../../db/devices-repo';
import { sha256 } from '../device-token';
import { readSession } from '../session';
import type { Caller } from './require-caller.type';

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

export { readCaller };
