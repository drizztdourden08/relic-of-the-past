/* @layer root-config @kind logic */
import { SANCTUARY_ROUTES } from '../../../../shared/sanctuary';
import { requireMember } from '../../../hub-core/auth/require-member';
import { loadVisibleReport, viewReport } from '../reports/report-view';
import type { Route } from '../../../hub-core/route.type';
import { SANCTUARY_SITE } from '../site';

const reportsGet: Route = {
  ...SANCTUARY_ROUTES.reportsGet,
  handler: async ({ req, res, params }) => {
    const member = await requireMember(req, SANCTUARY_SITE);
    const report = await loadVisibleReport(params.id, member);
    res.status(200).json({ report: viewReport(report, member) });
  },
};

export { reportsGet };
