/* @layer root-config @kind logic */
/** What a member sees of a report: everything but the anonymous reporter's
 *  email, which only an admin gets back. A caller without the reports right
 *  finds no report at all, so the page never shows through an error. */
import type { Report } from '../../../../shared/sanctuary';
import { notFound } from '../http/http-error';
import type { Member } from '../auth/require-access';
import { canSeeReports } from '../access/can-see';
import { reportsRepo } from '../db/reports-repo';

const viewReport = (report: Report, { user }: Member): Report =>
  user.access.state === 'admin' ? report : { ...report, contactEmail: null };

const loadReport = async (id: string): Promise<Report> => {
  const report = await reportsRepo.get(id);
  if (!report) throw notFound('No such report.');
  return report;
};

const loadVisibleReport = async (id: string, { rights }: Member): Promise<Report> => {
  if (!canSeeReports(rights)) throw notFound('No such report.');
  return loadReport(id);
};

export { viewReport, loadReport, loadVisibleReport };
