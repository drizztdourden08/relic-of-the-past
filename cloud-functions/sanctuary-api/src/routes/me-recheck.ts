/* @layer root-config @kind logic */
/** POST /me/recheck. Runs the access chain again without a provider token, so
 *  a new manual group or a new collaborator status shows up on demand. Discord
 *  roles need the Discord flow itself, which the site starts as a link. */
import { SANCTUARY_ROUTES } from '../../../../shared/sanctuary';
import { requireCaller } from '../auth/require-caller';
import { refreshAccess } from '../access/refresh-access';
import type { Route } from '../route.type';

const meRecheck: Route = {
  ...SANCTUARY_ROUTES.meRecheck,
  handler: async ({ req, res }) => {
    const caller = await requireCaller(req);
    const { access } = await refreshAccess(caller.userId, null);
    res.status(200).json({ access });
  },
};

export { meRecheck };
