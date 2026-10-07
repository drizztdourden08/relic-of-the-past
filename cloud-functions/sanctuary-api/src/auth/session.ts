/* @layer root-config @kind logic */
/** The browser session: an HS256 JWT `{ userId, v }` in an httpOnly cookie for
 *  LIMITS.sessionDays. `v` is compared with the user's sessionVersion on every
 *  read, so bumping that number signs the user out everywhere at once. */
import { SignJWT, jwtVerify } from 'jose';
import type { Request, Response } from '@google-cloud/functions-framework';
import { LIMITS } from '../../../../shared/sanctuary';
import { readSlot, writeSlot } from '../http/session-jar';
import { usersRepo } from '../db/users-repo';
import { signingKey } from './signing-key';

type Session = { userId: string; v: number };

const TTL_SECONDS = LIMITS.sessionDays * 24 * 60 * 60;

const signSession = (session: Session): Promise<string> =>
  new SignJWT({ userId: session.userId, v: session.v })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime(`${TTL_SECONDS}s`)
    .sign(signingKey());

const setSessionCookie = (req: Request, res: Response, jwt: string): void => {
  writeSlot(req, res, 'session', jwt);
};

const clearSessionCookie = (req: Request, res: Response): void => {
  writeSlot(req, res, 'session', null);
};

/** Signs the user in on this response with their current session version. */
const startSession = async (req: Request, res: Response, userId: string): Promise<void> => {
  const user = await usersRepo.get(userId);
  setSessionCookie(req, res, await signSession({ userId, v: user?.sessionVersion ?? 1 }));
};

const readSession = async (req: Request): Promise<Session | null> => {
  const jwt = readSlot(req, 'session');
  if (!jwt) return null;
  try {
    const { payload } = await jwtVerify(jwt, signingKey(), { algorithms: ['HS256'] });
    const { userId, v } = payload as { userId?: unknown; v?: unknown };
    if (typeof userId !== 'string' || typeof v !== 'number') return null;
    const user = await usersRepo.get(userId);
    return user && user.sessionVersion === v ? { userId, v } : null;
  } catch {
    return null;
  }
};

export { signSession, setSessionCookie, clearSessionCookie, startSession, readSession };
export type { Session };
