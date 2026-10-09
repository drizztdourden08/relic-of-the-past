/* @layer root-config @kind logic */
import { LIMITS, SANCTUARY_ROUTES, reportAttachmentSchema } from '@rotp/hub-contracts';
import { conflict, forbidden } from '@rotp/hub-server';
import { parseBody } from '@rotp/hub-server';
import { readCaller } from '@rotp/hub-server';
import { reportsRepo } from '../db/reports-repo';
import { loadReport } from '../reports/report-view';
import { reportKey } from '../storage/keys';
import { filesBucket } from '../storage/files-bucket';
import { verifyUpload } from '@rotp/hub-server';
import type { Route } from '@rotp/hub-server';

const reportsComplete: Route = {
  ...SANCTUARY_ROUTES.reportsComplete,
  handler: async ({ req, res, params }) => {
    const caller = await readCaller(req);
    const report = await loadReport(params.id);
    if ((report.reporter?.userId ?? null) !== (caller?.userId ?? null)) throw forbidden('Not your report.');
    if (report.zip) throw conflict('This report already has its zip.');
    const attachment = parseBody(reportAttachmentSchema, req.body);
    const bytes = await verifyUpload(filesBucket, reportKey(report.id), attachment.bytes, LIMITS.reportBytes);
    const zip = { bytes, contents: attachment.contents };
    await reportsRepo.update(report.id, { zip });
    res.status(200).json({ report: { ...report, zip } });
  },
};

export { reportsComplete };
