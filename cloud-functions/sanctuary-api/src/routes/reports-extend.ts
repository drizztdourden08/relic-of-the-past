/* @layer root-config @kind logic */
import { LIMITS, SANCTUARY_ROUTES, extendReportSchema } from '../../../../shared/sanctuary';
import { conflict } from '../../../hub-core/http/http-error';
import { parseBody } from '../../../hub-core/http/parse-body';
import { requireMember } from '../../../hub-core/auth/require-member';
import { reportsRepo } from '../db/reports-repo';
import { now } from '../../../hub-core/db/firestore';
import { expiryOf } from '../reports/expiry';
import { DAY_MS } from '../reports/expiry.constants';
import { loadVisibleReport, viewReport } from '../reports/report-view';
import type { Route } from '../../../hub-core/route.type';
import { SANCTUARY_SITE } from '../site';

const reportsExtend: Route = {
  ...SANCTUARY_ROUTES.reportsExtend,
  handler: async ({ req, res, params }) => {
    const member = await requireMember(req, SANCTUARY_SITE);
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
