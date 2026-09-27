/* @layer root-config @kind logic */
/** POST /reports/:id/download. A presigned GET for the zip, ten minutes. */
import { LIMITS, SANCTUARY_ROUTES } from '../../../../shared/sanctuary';
import { notFound } from '../../../hub-core/http/http-error';
import { requireMember } from '../../../hub-core/auth/require-member';
import { loadVisibleReport } from '../reports/report-view';
import { filesBucket } from '../storage/files-bucket';
import { reportKey } from '../storage/keys';
import type { Route } from '../../../hub-core/route.type';
import { SANCTUARY_SITE } from '../site';

const reportsDownload: Route = {
  ...SANCTUARY_ROUTES.reportsDownload,
  handler: async ({ req, res, params }) => {
    const member = await requireMember(req, SANCTUARY_SITE);
    const report = await loadVisibleReport(params.id, member);
    if (!report.zip) throw notFound('This report has no zip.');
    const url = await filesBucket.signDownload(reportKey(report.id), `${report.id}.zip`);
    res.status(200).json({ url, expiresInSeconds: LIMITS.downloadUrlSeconds });
  },
};

export { reportsDownload };
