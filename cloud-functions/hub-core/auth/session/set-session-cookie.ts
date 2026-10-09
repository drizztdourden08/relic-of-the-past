/* @layer hub-core @kind logic */
import type { Request, Response } from '@google-cloud/functions-framework';
import { writeSlot } from '../../http/session-jar';

const setSessionCookie = (req: Request, res: Response, jwt: string): void => {
  writeSlot(req, res, 'session', jwt);
};

export { setSessionCookie };
