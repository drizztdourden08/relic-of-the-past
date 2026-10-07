/* @layer root-config @kind logic */
/** POST /admin/sweep, for Cloud Scheduler, behind hub-core's scheduler guard. Nothing a
 *  browser session can call. */
import { SANCTUARY_ROUTES } from '../../../../shared/sanctuary';
import { requireScheduler } from '../../../hub-core/scheduler/scheduler-guard';
import type { Route } from '../../../hub-core/route.type';
import { SANCTUARY_SITE } from '../site';
import { sweepReports } from '../reports/sweep';

const sweepAudience = (): string => `${SANCTUARY_SITE.origin()}/api${SANCTUARY_ROUTES.adminSweep.path}`;

const adminSweep: Route = {
  ...SANCTUARY_ROUTES.adminSweep,
  handler: async ({ req, res }) => {
    await requireScheduler(req, sweepAudience(), 'The sweep runs from the scheduler only.');
    res.status(200).json(await sweepReports());
  },
};

export { adminSweep };
