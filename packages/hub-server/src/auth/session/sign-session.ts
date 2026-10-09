/* @layer hub-core @kind logic */
import { SignJWT } from 'jose';
import { signingKey } from '../signing-key';
import { TTL_SECONDS } from './session.constants';
import type { Session } from './session.type';

const signSession = (session: Session): Promise<string> =>
  new SignJWT({ userId: session.userId, v: session.v })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime(`${TTL_SECONDS}s`)
    .sign(signingKey());

export { signSession };
