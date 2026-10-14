/* @layer hub-core @kind logic */
import { jwtVerify } from 'jose';
import type { Request, Response } from '@google-cloud/functions-framework';
import type { Provider } from '@rotp/hub-contracts';
import { badRequest } from '../../http/http-error';
import { readSlot, writeSlot } from '../../http/session-jar';
import { signingKey } from '../signing-key';
import { isSignedOauthState } from './is-signed-oauth-state';
import type { OauthState } from './oauth-state.type';

const readOauthState = async (req: Request, res: Response, provider: Provider): Promise<OauthState> => {
  const jwt = readSlot(req, 'oauth');
  const echoed = typeof req.query.state === 'string' ? req.query.state : null;
  writeSlot(req, res, 'oauth', null);
  if (!jwt || !echoed) throw badRequest('The sign-in flow expired. Start again.');
  try {
    const { payload } = await jwtVerify(jwt, signingKey(), { algorithms: ['HS256'] });
    if (!isSignedOauthState(payload) || payload.jti !== echoed || payload.provider !== provider) throw new Error('mismatch');
    return { provider: payload.provider, intent: payload.intent, verifier: payload.verifier, returnTo: payload.returnTo };
  } catch {
    throw badRequest('The sign-in flow did not match. Start again.');
  }
};

export { readOauthState };
