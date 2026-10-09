/* @layer hub-core @kind logic */
import type { Request, Response } from '@google-cloud/functions-framework';
import { usersRepo } from '../../db/users-repo';
import { setSessionCookie } from './set-session-cookie';
import { signSession } from './sign-session';

const startSession = async (req: Request, res: Response, userId: string): Promise<void> => {
  const user = await usersRepo.get(userId);
  setSessionCookie(req, res, await signSession({ userId, v: user?.sessionVersion ?? 1 }));
};

export { startSession };
