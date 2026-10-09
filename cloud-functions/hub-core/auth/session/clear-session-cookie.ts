/* @layer hub-core @kind logic */
import type { Request, Response } from '@google-cloud/functions-framework';
import { writeSlot } from '../../http/session-jar';

const clearSessionCookie = (req: Request, res: Response): void => {
  writeSlot(req, res, 'session', null);
};

export { clearSessionCookie };
