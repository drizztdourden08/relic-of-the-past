/* @layer hub-core @kind logic */
import { HUB_ROUTES } from '@rotp/hub-contracts';
import { queryFlag } from '../http/query';
import { clearSessionCookie, readSession } from '../auth/session';
import { usersRepo } from '../db/users-repo';
import type { Route } from '../route.type';

const authSignOut: Route = {
  ...HUB_ROUTES.authSignOut,
  handler: async ({ req, res }) => {
    const session = await readSession(req);
    if (session && queryFlag(req, 'everywhere')) await usersRepo.bumpSessionVersion(session.userId);
    clearSessionCookie(req, res);
    res.status(200).json({ ok: true });
  },
};

export { authSignOut };
