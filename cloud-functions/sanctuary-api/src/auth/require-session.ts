/* @layer root-config @kind logic */
/** Routes only the site may call: the cookie session, never a device token. */
import type { Request } from '@google-cloud/functions-framework';
import { unauthorized } from '../http/http-error';
import { readSession } from './session';
import type { Session } from './session';

const requireSession = async (req: Request): Promise<Session> => {
  const session = await readSession(req);
  if (!session) throw unauthorized();
  return session;
};

export { requireSession };
