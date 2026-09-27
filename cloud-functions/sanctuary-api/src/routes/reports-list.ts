/* @layer root-config @kind logic */
/** GET /reports?mine&state&cursor. Every caller with the reports right sees
 *  every report; without it the list is empty. An anonymous reporter's email is
 *  only in the admin's copy. */
import { SANCTUARY_ROUTES, canSeeReports } from '../../../../shared/sanctuary';
import { badRequest } from '../../../hub-core/http/http-error';
import { queryFlag, queryParam } from '../../../hub-core/http/query';
import { requireMember } from '../../../hub-core/auth/require-member';
import { reportsRepo } from '../db/reports-repo';
import { viewReport } from '../reports/report-view';
import type { Route } from '../../../hub-core/route.type';
import { SANCTUARY_SITE } from '../site';

const PAGE_SIZE = 200;

const readState = (raw: string | undefined): 'open' | 'closed' | null => {
  if (raw === undefined) return null;
  if (raw === 'open' || raw === 'closed') return raw;
  throw badRequest('State is open or closed.');
};

const reportsList: Route = {
  ...SANCTUARY_ROUTES.reportsList,
  handler: async ({ req, res }) => {
    const member = await requireMember(req, SANCTUARY_SITE);
    const filter = {
      mineUserId: queryFlag(req, 'mine') ? member.caller.userId : null,
      state: readState(queryParam(req, 'state')),
      cursor: queryParam(req, 'cursor'),
    };
    if (!canSeeReports(member.rights)) {
      res.status(200).json({ reports: [], nextCursor: null });
      return;
    }
    const { items, nextCursor } = await reportsRepo.list(filter, PAGE_SIZE);
    res.status(200).json({ reports: items.map((report) => viewReport(report, member)), nextCursor });
  },
};

export { reportsList };
