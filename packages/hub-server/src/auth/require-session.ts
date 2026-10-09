/* @layer hub-core @kind logic */
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
