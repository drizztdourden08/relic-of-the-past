/* @layer root-config @kind logic */
/** POST /admin/sweep, for Cloud Scheduler. Accepted with a Google OIDC token
 *  for a service account, audience this route's URL, or with an `x-sweep-key`
 *  header equal to SWEEP_KEY. Nothing a browser session can call. */
import { createRemoteJWKSet, jwtVerify } from 'jose';
import type { Request } from '@google-cloud/functions-framework';
import { SANCTUARY_ROUTES } from '../../../../shared/sanctuary';
import { readEnv } from '../env';
import { forbidden } from '../http/http-error';
import { sweepReports } from '../reports/sweep';
import type { Route } from '../route.type';

const GOOGLE_CERTS = new URL('https://www.googleapis.com/oauth2/v3/certs');
const GOOGLE_ISSUERS = ['https://accounts.google.com', 'accounts.google.com'];
const SERVICE_ACCOUNT_SUFFIX = 'gserviceaccount.com';

let jwks: ReturnType<typeof createRemoteJWKSet> | null = null;

const googleKeys = () => {
  if (!jwks) jwks = createRemoteJWKSet(GOOGLE_CERTS);
  return jwks;
};

const sweepAudience = (): string => `${readEnv().SANCTUARY_ORIGIN}/api${SANCTUARY_ROUTES.adminSweep.path}`;

const hasSweepKey = (req: Request): boolean => {
  const key = readEnv().SWEEP_KEY;
  const header = req.headers['x-sweep-key'];
  return key !== null && typeof header === 'string' && header === key;
};

const hasServiceAccountToken = async (req: Request): Promise<boolean> => {
  const header = req.headers.authorization;
  if (!header?.startsWith('Bearer ')) return false;
  try {
    const { payload } = await jwtVerify(header.slice('Bearer '.length), googleKeys(), {
      issuer: GOOGLE_ISSUERS,
      audience: sweepAudience(),
    });
    const email = typeof payload.email === 'string' ? payload.email : '';
    return payload.email_verified === true && email.endsWith(SERVICE_ACCOUNT_SUFFIX);
  } catch {
    return false;
  }
};

const adminSweep: Route = {
  ...SANCTUARY_ROUTES.adminSweep,
  handler: async ({ req, res }) => {
    if (!hasSweepKey(req) && !(await hasServiceAccountToken(req))) throw forbidden('The sweep runs from the scheduler only.');
    res.status(200).json(await sweepReports());
  },
};

export { adminSweep };
