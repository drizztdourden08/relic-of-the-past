/* @layer root-config @kind logic */
import { SANCTUARY_ROUTES, canSeeReports } from '@rotp/hub-contracts';
import { badRequest } from '@rotp/hub-server';
import { queryFlag, queryParam } from '@rotp/hub-server';
import { requireMember } from '@rotp/hub-server';
import { reportsRepo } from '../db/reports-repo';
import { viewReport } from '../reports/report-view';
import type { Route } from '@rotp/hub-server';
import { SANCTUARY_SITE } from '../site';
import { PAGE_SIZE } from './reports-list.constants';

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
