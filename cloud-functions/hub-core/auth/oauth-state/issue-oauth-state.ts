/* @layer hub-core @kind logic */
import { SignJWT } from 'jose';
import type { Request, Response } from '@google-cloud/functions-framework';
import { writeSlot, OAUTH_TTL_SECONDS } from '../../http/session-jar';
import { signingKey } from '../signing-key';
import type { OauthState } from './oauth-state.type';
import { randomToken } from './random-token';

const issueOauthState = async (req: Request, res: Response, state: OauthState): Promise<string> => {
  const stateId = randomToken();
  const jwt = await new SignJWT({ ...state })
    .setProtectedHeader({ alg: 'HS256' })
    .setJti(stateId)
    .setIssuedAt()
    .setExpirationTime(`${OAUTH_TTL_SECONDS}s`)
    .sign(signingKey());
  writeSlot(req, res, 'oauth', jwt);
  return stateId;
};

export { issueOauthState };
