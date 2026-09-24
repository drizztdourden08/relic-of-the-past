/* @layer root-config @kind logic */
/** POST /auth/signout[?everywhere]
 *  Clears the cookie. With `everywhere`, bumps the session version so every
 *  other browser's cookie stops verifying too. */
import { SANCTUARY_ROUTES } from '../../../../shared/sanctuary';
import { queryFlag } from '../http/query';
import { clearSessionCookie, readSession } from '../auth/session';
import { usersRepo } from '../db/users-repo';
import type { Route } from '../route.type';

const authSignOut: Route = {
  ...SANCTUARY_ROUTES.authSignOut,
  handler: async ({ req, res }) => {
    const session = await readSession(req);
    if (session && queryFlag(req, 'everywhere')) await usersRepo.bumpSessionVersion(session.userId);
    clearSessionCookie(res);
    res.status(200).json({ ok: true });
  },
};

export { authSignOut };
