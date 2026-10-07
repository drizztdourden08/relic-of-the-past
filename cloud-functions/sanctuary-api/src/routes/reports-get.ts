/* @layer root-config @kind logic */
/** GET /reports/:id. One report, the email redacted for non-admins. */
import { SANCTUARY_ROUTES } from '../../../../shared/sanctuary';
import { requireAccess } from '../auth/require-access';
import { loadVisibleReport, viewReport } from '../reports/report-view';
import type { Route } from '../route.type';

const reportsGet: Route = {
  ...SANCTUARY_ROUTES.reportsGet,
  handler: async ({ req, res, params }) => {
    const member = await requireAccess(req);
    const report = await loadVisibleReport(params.id, member);
    res.status(200).json({ report: viewReport(report, member) });
  },
};

export { reportsGet };
