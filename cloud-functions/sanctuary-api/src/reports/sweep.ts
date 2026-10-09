/* @layer root-config @kind logic */
import type { Report } from '@rotp/hub-contracts';
import { reportsRepo } from '../db/reports-repo';
import { now } from '../../../hub-core/db/firestore';
import { github } from '../github/issues';
import { filesBucket } from '../storage/files-bucket';
import { reportKey } from '../storage/keys';
import { expiryOf } from './expiry';
import { isExpired } from './is-expired';
import type { SweepResult } from './sweep.type';

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
  if (report.zip) await filesBucket.remove(reportKey(report.id));
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
