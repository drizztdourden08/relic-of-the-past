/* @layer root-config @kind logic */
/** POST /reports/:id/download. A presigned GET for the zip, ten minutes. */
import { LIMITS, SANCTUARY_ROUTES } from '../../../../shared/sanctuary';
import { notFound } from '../http/http-error';
import { requireAccess } from '../auth/require-access';
import { loadReport } from '../reports/report-view';
import { b2, reportKey } from '../storage/b2';
import type { Route } from '../route.type';

const reportsDownload: Route = {
  ...SANCTUARY_ROUTES.reportsDownload,
  handler: async ({ req, res, params }) => {
    await requireAccess(req);
    const report = await loadReport(params.id);
    if (!report.zip) throw notFound('This report has no zip.');
    const url = await b2.signDownload(reportKey(report.id), `${report.id}.zip`);
    res.status(200).json({ url, expiresInSeconds: LIMITS.downloadUrlSeconds });
  },
};

export { reportsDownload };
