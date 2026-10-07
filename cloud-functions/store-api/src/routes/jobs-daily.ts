/* @layer store-api @kind logic */
/** POST /jobs/daily, for Cloud Scheduler, behind hub-core's scheduler guard. Nothing a
 *  browser session or a device token can call. */
import { STORE_ROUTES } from '../../../../shared/store/api-contract';
import { requireScheduler } from '../../../hub-core/scheduler/scheduler-guard';
import type { Route } from '../../../hub-core/route.type';
import { STORE_SITE } from '../site';
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
