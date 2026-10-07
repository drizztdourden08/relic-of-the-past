/* @layer store-api @kind logic */
/** PUT /home/welcome { welcome }. The markdown message at the top of the home page, for
 *  anyone holding the store's feature permission. */
import { STORE_ROUTES } from '../../../../shared/store/api-contract';
import type { WelcomeResponse } from '../../../../shared/store/api-types';
import { welcomeSchema } from '../../../../shared/store/schemas';
import { parseBody } from '../../../hub-core/http/parse-body';
import { now } from '../../../hub-core/db/firestore';
import type { Route } from '../../../hub-core/route.type';
import { personOf, requirePermission } from '../auth/player';
import { settingsRepo } from '../db/settings-repo';
import { invalidateHome } from '../home/home-cache';

const homeWelcome: Route = {
  ...STORE_ROUTES.homeWelcome,
  handler: async ({ req, res }) => {
    const player = await requirePermission(req, 'feature');
    const { welcome } = parseBody(welcomeSchema, req.body);
    const body: WelcomeResponse = { welcome, updatedBy: personOf(player), updatedAt: now() };
    await settingsRepo.setHome(body);
    invalidateHome();
    res.status(200).json(body);
  },
};

export { homeWelcome };
