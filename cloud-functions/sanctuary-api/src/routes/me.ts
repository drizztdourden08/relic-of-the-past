/* @layer root-config @kind logic */
/** GET /me. The site's first call and the app's identity check: the user, the
 *  linked identities, the access state, and the caller's groups and rights so
 *  the site can hide what the API would refuse, by either credential. */
import { SANCTUARY_ROUTES } from '../../../../shared/sanctuary';
import { unauthorized } from '../http/http-error';
import { requireCaller } from '../auth/require-caller';
import { callerRights } from '../access/caller-rights';
import { usersRepo } from '../db/users-repo';
import { identitiesRepo } from '../db/identities-repo';
import type { Route } from '../route.type';

const me: Route = {
  ...SANCTUARY_ROUTES.me,
  handler: async ({ req, res }) => {
    const caller = await requireCaller(req);
    const [user, identities] = await Promise.all([usersRepo.get(caller.userId), identitiesRepo.forUser(caller.userId)]);
    if (!user) throw unauthorized();
    const { groups, rights } = await callerRights(user);
    res.status(200).json({ user, identities, groups, rights, via: caller.via, deviceId: caller.deviceId });
  },
};

export { me };
