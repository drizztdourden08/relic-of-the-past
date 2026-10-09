/* @layer store-api @kind logic */
import { STORE_ROUTES } from '@rotp/hub-contracts';
import { requireScheduler } from '@rotp/hub-server';
import type { Route } from '@rotp/hub-server';
import { STORE_SITE } from '../site.constants';
import { runDaily } from '../jobs/daily';

const dailyAudience = (): string => `${STORE_SITE.origin()}/api${STORE_ROUTES.jobsDaily.path}`;

const jobsDaily: Route = {
  ...STORE_ROUTES.jobsDaily,
  handler: async ({ req, res }) => {
    await requireScheduler(req, dailyAudience(), 'The daily job runs from the scheduler only.');
    res.status(200).json(await runDaily());
  },
};

export { jobsDaily };
