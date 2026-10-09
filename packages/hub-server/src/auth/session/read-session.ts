/* @layer hub-core @kind logic */
import { jwtVerify } from 'jose';
import type { Request } from '@google-cloud/functions-framework';
import { readSlot } from '../../http/session-jar';
import { usersRepo } from '../../db/users-repo';
import { signingKey } from '../signing-key';
import type { Session, UnverifiedSessionClaims } from './session.type';

const readSession = async (req: Request): Promise<Session | null> => {
  const jwt = readSlot(req, 'session');
  if (!jwt) return null;
  try {
    const { payload } = await jwtVerify(jwt, signingKey(), { algorithms: ['HS256'] });
    const { userId, v } = payload as UnverifiedSessionClaims;
    if (typeof userId !== 'string' || typeof v !== 'number') return null;
    const user = await usersRepo.get(userId);
    return user && user.sessionVersion === v ? { userId, v } : null;
  } catch {
    return null;
  }
};

export { readSession };
