/* @layer root-config @kind logic */
/** DELETE /reports/:id, admin only. Removes the zip and the record; the sweep
 *  is the only other way a report goes away. */
import { SANCTUARY_ROUTES } from '../../../../shared/sanctuary';
import { requireAdmin } from '../../../hub-core/auth/require-admin';
import { reportsRepo } from '../db/reports-repo';
import { loadReport } from '../reports/report-view';
import { filesBucket } from '../storage/files-bucket';
import { reportKey } from '../storage/keys';
import type { Route } from '../../../hub-core/route.type';
import { SANCTUARY_SITE } from '../site';

const reportsDelete: Route = {
  ...SANCTUARY_ROUTES.reportsDelete,
  handler: async ({ req, res, params }) => {
    await requireAdmin(req, SANCTUARY_SITE);
    const report = await loadReport(params.id);
    if (report.zip) await filesBucket.remove(reportKey(report.id));
    await reportsRepo.remove(report.id);
    res.status(200).json({ ok: true });
  },
};

export { reportsDelete };
