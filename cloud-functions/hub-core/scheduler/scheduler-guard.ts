/* @layer hub-core @kind logic */
/** The check in front of every route Cloud Scheduler calls. Accepted with a Google OIDC
 *  token for a service account whose audience is the route's own URL, or with an
 *  `x-sweep-key` header equal to SWEEP_KEY. Nothing a browser session can call. */
import { createRemoteJWKSet, jwtVerify } from 'jose';
import type { Request } from '@google-cloud/functions-framework';
import { readHubEnv } from '../env';
import { forbidden } from '../http/http-error';

const GOOGLE_CERTS = new URL('https://www.googleapis.com/oauth2/v3/certs');
const GOOGLE_ISSUERS = ['https://accounts.google.com', 'accounts.google.com'];
const SERVICE_ACCOUNT_SUFFIX = 'gserviceaccount.com';

let jwks: ReturnType<typeof createRemoteJWKSet> | null = null;

const googleKeys = () => {
  if (!jwks) jwks = createRemoteJWKSet(GOOGLE_CERTS);
  return jwks;
};

const hasSweepKey = (req: Request): boolean => {
  const key = readHubEnv().SWEEP_KEY;
  const header = req.headers['x-sweep-key'];
  return key !== null && typeof header === 'string' && header === key;
};

const hasServiceAccountToken = async (req: Request, audience: string): Promise<boolean> => {
  const header = req.headers.authorization;
  if (!header?.startsWith('Bearer ')) return false;
  try {
    const { payload } = await jwtVerify(header.slice('Bearer '.length), googleKeys(), { issuer: GOOGLE_ISSUERS, audience });
    const email = typeof payload.email === 'string' ? payload.email : '';
    return payload.email_verified === true && email.endsWith(SERVICE_ACCOUNT_SUFFIX);
  } catch {
    return false;
  }
};

/** Throws a 403 unless the scheduler (or the sweep key) is calling; `audience` is the route's full URL. */
const requireScheduler = async (req: Request, audience: string, refusal: string): Promise<void> => {
  if (!hasSweepKey(req) && !(await hasServiceAccountToken(req, audience))) throw forbidden(refusal);
};

export { requireScheduler };
