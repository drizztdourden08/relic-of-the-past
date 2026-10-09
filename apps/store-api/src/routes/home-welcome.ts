/* @layer store-api @kind logic */
import { STORE_ROUTES } from '@rotp/hub-contracts';
import type { WelcomeResponse } from '@rotp/hub-contracts';
import { welcomeSchema } from '@rotp/hub-contracts';
import { parseBody } from '@rotp/hub-server';
import { now } from '@rotp/hub-server';
import type { Route } from '@rotp/hub-server';
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
