/* @layer hub-core @kind logic */
import { createRemoteJWKSet, jwtVerify } from 'jose';
import type { Request } from '@google-cloud/functions-framework';
import { readHubEnv } from '../env';
import { forbidden } from '../http/http-error';
import { GOOGLE_CERTS, GOOGLE_ISSUERS, SWEEP_KEY_HEADER } from './scheduler-guard.constants';

let jwks: ReturnType<typeof createRemoteJWKSet> | null = null;

const googleKeys = () => {
  if (!jwks) jwks = createRemoteJWKSet(GOOGLE_CERTS);
  return jwks;
};

const hasSweepKey = (req: Request): boolean => {
  const key = readHubEnv().SWEEP_KEY;
  const header = req.headers[SWEEP_KEY_HEADER];
  return key !== null && typeof header === 'string' && header === key;
};

const isSchedulerAccountToken = async (req: Request, audience: string): Promise<boolean> => {
  const schedulerAccount = readHubEnv().SCHEDULER_SA;
  const header = req.headers.authorization;
  if (!schedulerAccount || !header?.startsWith('Bearer ')) return false;
  try {
    const { payload } = await jwtVerify(header.slice('Bearer '.length), googleKeys(), { issuer: GOOGLE_ISSUERS, audience });
    const email = typeof payload.email === 'string' ? payload.email.toLowerCase() : '';
    return payload.email_verified === true && email === schedulerAccount;
  } catch {
    return false;
  }
};

const requireScheduler = async (req: Request, audience: string, refusal: string): Promise<void> => {
  if (!hasSweepKey(req) && !(await isSchedulerAccountToken(req, audience))) throw forbidden(refusal);
};

export { requireScheduler };
