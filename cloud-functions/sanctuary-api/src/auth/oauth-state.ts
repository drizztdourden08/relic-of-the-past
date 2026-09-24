/* @layer root-config @kind logic */
/** The signed OAuth state: a short JWT in a cookie that carries the provider,
 *  the intent, the PKCE verifier and where to return. The provider echoes its
 *  `state` query back; it must equal the JWT's id, so a callback can only
 *  finish the flow that started it. */
import { SignJWT, jwtVerify } from 'jose';
import { randomBytes } from 'node:crypto';
import type { Request, Response } from '@google-cloud/functions-framework';
import type { Provider } from '../../../../shared/sanctuary';
import { badRequest } from '../http/http-error';
import { readCookie, setCookie, clearCookie } from '../http/cookies';
import { signingKey } from './signing-key';

type OauthIntent = 'signin' | 'link' | 'device';
type OauthState = { provider: Provider; intent: OauthIntent; verifier: string; returnTo: string };

const COOKIE = 'sanctuary_oauth';
const COOKIE_PATH = '/api/auth';
const TTL_SECONDS = 10 * 60;

const randomToken = (): string => randomBytes(32).toString('base64url');

/** A return path stays on the site: relative, and never protocol-relative. */
const safeReturnTo = (raw: string | undefined): string =>
  raw && raw.startsWith('/') && !raw.startsWith('//') ? raw : '/';

const issueOauthState = async (res: Response, state: OauthState): Promise<string> => {
  const stateId = randomToken();
  const jwt = await new SignJWT({ ...state })
    .setProtectedHeader({ alg: 'HS256' })
    .setJti(stateId)
    .setIssuedAt()
    .setExpirationTime(`${TTL_SECONDS}s`)
    .sign(signingKey());
  setCookie(res, COOKIE, jwt, { maxAgeSeconds: TTL_SECONDS, path: COOKIE_PATH });
  return stateId;
};

const readOauthState = async (req: Request, res: Response, provider: Provider): Promise<OauthState> => {
  const jwt = readCookie(req, COOKIE);
  const echoed = typeof req.query.state === 'string' ? req.query.state : null;
  clearCookie(res, COOKIE, COOKIE_PATH);
  if (!jwt || !echoed) throw badRequest('The sign-in flow expired. Start again.');
  try {
    const { payload } = await jwtVerify(jwt, signingKey(), { algorithms: ['HS256'] });
    const state = payload as unknown as OauthState & { jti: string };
    if (state.jti !== echoed || state.provider !== provider) throw new Error('mismatch');
    return { provider: state.provider, intent: state.intent, verifier: state.verifier, returnTo: state.returnTo };
  } catch {
    throw badRequest('The sign-in flow did not match. Start again.');
  }
};

export { issueOauthState, readOauthState, safeReturnTo, randomToken };
export type { OauthIntent, OauthState };
