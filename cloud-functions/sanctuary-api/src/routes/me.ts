/* @layer root-config @kind logic */
/** GET /me. The site's first call and the app's identity check: the user,
 *  the linked identities and the access state, by either credential. */
import { SANCTUARY_ROUTES } from '../../../../shared/sanctuary';
import { unauthorized } from '../http/http-error';
import { requireCaller } from '../auth/require-caller';
import { usersRepo } from '../db/users-repo';
import { identitiesRepo } from '../db/identities-repo';
import type { Route } from '../route.type';

const me: Route = {
  ...SANCTUARY_ROUTES.me,
  handler: async ({ req, res }) => {
    const caller = await requireCaller(req);
    const [user, identities] = await Promise.all([usersRepo.get(caller.userId), identitiesRepo.forUser(caller.userId)]);
    if (!user) throw unauthorized();
    res.status(200).json({ user, identities, via: caller.via, deviceId: caller.deviceId });
  },
};

export { me };
