/* @layer root-config @kind logic */
/** DELETE /reports/:id, admin only. Removes the zip and the record; the sweep
 *  is the only other way a report goes away. */
import { SANCTUARY_ROUTES } from '../../../../shared/sanctuary';
import { requireAdmin } from '../auth/require-admin';
import { reportsRepo } from '../db/reports-repo';
import { loadReport } from '../reports/report-view';
import { b2, reportKey } from '../storage/b2';
import type { Route } from '../route.type';

const reportsDelete: Route = {
  ...SANCTUARY_ROUTES.reportsDelete,
  handler: async ({ req, res, params }) => {
    await requireAdmin(req);
    const report = await loadReport(params.id);
    if (report.zip) await b2.remove(reportKey(report.id));
    await reportsRepo.remove(report.id);
    res.status(200).json({ ok: true });
  },
};

export { reportsDelete };
