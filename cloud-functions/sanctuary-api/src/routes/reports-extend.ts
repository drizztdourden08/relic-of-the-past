/* @layer root-config @kind logic */
/** POST /reports/:id/extend. Pushes the expiry 30 days past its current value,
 *  never further than a year after the issue closed. Only a closed issue has
 *  a close to count from; an open one is not expiring on that clock yet. */
import { LIMITS, SANCTUARY_ROUTES, extendReportSchema } from '../../../../shared/sanctuary';
import { conflict } from '../http/http-error';
import { parseBody } from '../http/parse-body';
import { requireAccess } from '../auth/require-access';
import { reportsRepo } from '../db/reports-repo';
import { now } from '../db/firestore';
import { DAY_MS, expiryOf } from '../reports/expiry';
import { loadVisibleReport, viewReport } from '../reports/report-view';
import type { Route } from '../route.type';

const reportsExtend: Route = {
  ...SANCTUARY_ROUTES.reportsExtend,
  handler: async ({ req, res, params }) => {
    const member = await requireAccess(req);
    parseBody(extendReportSchema, req.body);
    const report = await loadVisibleReport(params.id, member);
    const closedAt = report.issue.closedAt;
    if (closedAt === null) throw conflict('The issue is still open; there is nothing to extend yet.');
    const cap = closedAt + LIMITS.extendMaxDays * DAY_MS;
    const current = expiryOf(report);
    if (current >= cap) throw conflict('This report is already at its longest.');
    const extendedUntil = Math.min(Math.max(current, now()) + LIMITS.extendDays * DAY_MS, cap);
    await reportsRepo.extend(report.id, extendedUntil, extendedUntil, member.caller.userId);
    res.status(200).json({ report: viewReport({ ...report, extendedUntil, expiresAt: extendedUntil }, member) });
  },
};

export { reportsExtend };
