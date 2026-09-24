/* @layer root-config @kind logic */
/** POST /me/recheck. Runs the access chain again without a provider token, so
 *  a fresh grant or a new collaborator status shows up on demand. The Discord
 *  role needs the Discord flow itself, which the site starts as a link. */
import { SANCTUARY_ROUTES } from '../../../../shared/sanctuary';
import { requireCaller } from '../auth/require-caller';
import { evaluateAccess } from '../access/evaluate-access';
import { usersRepo } from '../db/users-repo';
import type { Route } from '../route.type';

const meRecheck: Route = {
  ...SANCTUARY_ROUTES.meRecheck,
  handler: async ({ req, res }) => {
    const caller = await requireCaller(req);
    const access = await evaluateAccess(caller.userId, null);
    await usersRepo.setAccess(caller.userId, access);
    res.status(200).json({ access });
  },
};

export { meRecheck };
