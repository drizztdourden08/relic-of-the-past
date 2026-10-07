/* @layer root-config @kind logic */
/** POST /reports/:id/complete { bytes, contents }, same caller as the create.
 *  HEADs the zip against the declared size and fills the record's zip block. */
import { LIMITS, SANCTUARY_ROUTES, reportAttachmentSchema } from '../../../../shared/sanctuary';
import { conflict, forbidden } from '../http/http-error';
import { parseBody } from '../http/parse-body';
import { readCaller } from '../auth/require-caller';
import { reportsRepo } from '../db/reports-repo';
import { loadReport } from '../reports/report-view';
import { reportKey } from '../storage/b2';
import { verifyUpload } from '../storage/verify-upload';
import type { Route } from '../route.type';

const reportsComplete: Route = {
  ...SANCTUARY_ROUTES.reportsComplete,
  handler: async ({ req, res, params }) => {
    const caller = await readCaller(req);
    const report = await loadReport(params.id);
    if ((report.reporter?.userId ?? null) !== (caller?.userId ?? null)) throw forbidden('Not your report.');
    if (report.zip) throw conflict('This report already has its zip.');
    const attachment = parseBody(reportAttachmentSchema, req.body);
    const bytes = await verifyUpload(reportKey(report.id), attachment.bytes, LIMITS.reportBytes);
    const zip = { bytes, contents: attachment.contents };
    await reportsRepo.update(report.id, { zip });
    res.status(200).json({ report: { ...report, zip } });
  },
};

export { reportsComplete };
