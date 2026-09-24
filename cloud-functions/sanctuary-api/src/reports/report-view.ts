/* @layer root-config @kind logic */
/** What a member sees of a report: everything but the anonymous reporter's
 *  email, which only an admin gets back. */
import type { Report } from '../../../../shared/sanctuary';
import { notFound } from '../http/http-error';
import type { Member } from '../auth/require-access';
import { reportsRepo } from '../db/reports-repo';

const viewReport = (report: Report, { user }: Member): Report =>
  user.access.state === 'admin' ? report : { ...report, contactEmail: null };

const loadReport = async (id: string): Promise<Report> => {
  const report = await reportsRepo.get(id);
  if (!report) throw notFound('No such report.');
  return report;
};

export { viewReport, loadReport };
