/* @layer hub-core @kind logic */
import type { Request } from '@google-cloud/functions-framework';
import { unauthorized } from '../../http/http-error';
import { readCaller } from './read-caller';
import type { Caller } from './require-caller.type';

const requireCaller = async (req: Request): Promise<Caller> => {
  const caller = await readCaller(req);
  if (!caller) throw unauthorized();
  return caller;
};

export { requireCaller };
