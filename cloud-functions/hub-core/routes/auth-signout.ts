/* @layer hub-core @kind logic */
/** POST /auth/signout[?everywhere]
 *  Clears the cookie. With `everywhere`, bumps the session version so every
 *  other browser's cookie stops verifying too. */
import { HUB_ROUTES } from '../../../shared/hub';
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
