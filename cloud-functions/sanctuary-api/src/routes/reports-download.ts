/* @layer root-config @kind logic */
import { LIMITS, SANCTUARY_ROUTES } from '@rotp/hub-contracts';
import { notFound } from '@rotp/hub-server';
import { requireMember } from '@rotp/hub-server';
import { loadVisibleReport } from '../reports/report-view';
import { filesBucket } from '../storage/files-bucket';
import { reportKey } from '../storage/keys';
import type { Route } from '@rotp/hub-server';
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
