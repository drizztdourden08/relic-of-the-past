/* @layer root-config @kind logic */
/** The daily pass: every open issue is read by number and its close written
 *  back, then every report past its expiry loses its zip and its record. The
 *  closed state written here is what the site shows. */
import type { Report } from '../../../../shared/sanctuary';
import { reportsRepo } from '../db/reports-repo';
import { now } from '../db/firestore';
import { github } from '../github/issues';
import { b2, reportKey } from '../storage/b2';
import { expiryOf, isExpired } from './expiry';

type SweepResult = { checked: number; closed: number; deleted: number };

/** Reads the issue when the record still says open; returns the report as it now stands. */
const refreshIssue = async (report: Report): Promise<Report> => {
  if (report.issue.state === 'closed') return report;
  const issue = await github.getIssue(report.issue.number);
  if (!issue || issue.state !== 'closed' || !issue.closed_at) return report;
  const closedAt = new Date(issue.closed_at).getTime();
  const updated: Report = { ...report, issue: { ...report.issue, state: 'closed', closedAt } };
  await reportsRepo.update(report.id, { issue: updated.issue, expiresAt: expiryOf(updated) });
  return updated;
};

const removeReport = async (report: Report): Promise<void> => {
  if (report.zip) await b2.remove(reportKey(report.id));
  await reportsRepo.remove(report.id);
};

const sweepReports = async (): Promise<SweepResult> => {
  const at = now();
  const reports = await reportsRepo.listForSweep();
  const result: SweepResult = { checked: reports.length, closed: 0, deleted: 0 };
  for (const report of reports) {
    const current = await refreshIssue(report);
    if (current !== report) result.closed += 1;
    if (!isExpired(current, at)) continue;
    await removeReport(current);
    result.deleted += 1;
  }
  return result;
};

export { sweepReports };
export type { SweepResult };
