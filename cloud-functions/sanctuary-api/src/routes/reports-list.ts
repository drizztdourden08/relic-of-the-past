/* @layer root-config @kind logic */
/** GET /reports?mine&state&cursor. Every member sees every report; an
 *  anonymous reporter's email is only in the admin's copy. */
import { SANCTUARY_ROUTES } from '../../../../shared/sanctuary';
import { badRequest } from '../http/http-error';
import { queryFlag, queryParam } from '../http/query';
import { requireAccess } from '../auth/require-access';
import { reportsRepo } from '../db/reports-repo';
import { viewReport } from '../reports/report-view';
import type { Route } from '../route.type';

const PAGE_SIZE = 200;

const readState = (raw: string | undefined): 'open' | 'closed' | null => {
  if (raw === undefined) return null;
  if (raw === 'open' || raw === 'closed') return raw;
  throw badRequest('State is open or closed.');
};

const reportsList: Route = {
  ...SANCTUARY_ROUTES.reportsList,
  handler: async ({ req, res }) => {
    const member = await requireAccess(req);
    const filter = {
      mineUserId: queryFlag(req, 'mine') ? member.caller.userId : null,
      state: readState(queryParam(req, 'state')),
      cursor: queryParam(req, 'cursor'),
    };
    const { items, nextCursor } = await reportsRepo.list(filter, PAGE_SIZE);
    res.status(200).json({ reports: items.map((report) => viewReport(report, member)), nextCursor });
  },
};

export { reportsList };
