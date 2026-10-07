/* @layer root-config @kind logic */
/** Filing a report, the same steps for every kind: quota for an anonymous
 *  caller, the record, the issue, the presigned PUT. Only the body renderer
 *  differs, and each kind supplies its own. */
import type { Report, ReportKind, SubmitReportRequest, SubmitReportResult } from '../../../../shared/sanctuary';
import { badRequest, tooMany } from '../http/http-error';
import type { Caller } from '../auth/require-caller';
import { usersRepo } from '../db/users-repo';
import { reportsRepo } from '../db/reports-repo';
import { rateLimitRepo } from '../db/rate-limit-repo';
import { now } from '../db/firestore';
import { github } from '../github/issues';
import { b2, reportKey } from '../storage/b2';
import { renderPlayerBody } from './issue-body-player';
import { renderControllerBody } from './issue-body-controller';
import type { IssueBodyRenderer } from './issue-body.type';
import { reporterLine } from './reporter-line';
import { newReportId } from './report-id';

const ZIP_CONTENT_TYPE = 'application/zip';

const BODY_BY_KIND: Record<ReportKind, IssueBodyRenderer> = {
  player: renderPlayerBody,
  controller: renderControllerBody,
};

const LABEL_BY_KIND: Record<ReportKind, string> = {
  player: 'player-report',
  controller: 'controller-report',
};

const createReport = async (caller: Caller | null, ip: string, body: SubmitReportRequest): Promise<SubmitReportResult> => {
  if (!caller) {
    if (!(await rateLimitRepo.checkRateLimit(ip))) throw tooMany('Too many reports. Try again later.');
    if (!body.contactEmail) throw badRequest('A contact email is needed when not signed in.');
  }
  const reporter = caller ? await usersRepo.summary(caller.userId) : null;
  const id = newReportId();
  const renderBody = BODY_BY_KIND[body.kind];
  const issue = await github.createIssue({
    title: body.subject,
    body: renderBody({ ...body, reporterLine: await reporterLine(reporter), reportId: id }),
    labels: [LABEL_BY_KIND[body.kind]],
  });
  const report: Report = {
    id,
    kind: body.kind,
    subject: body.subject,
    reporter,
    contactEmail: caller ? null : body.contactEmail,
    appVersion: body.context.appVersion,
    platform: body.context.platform,
    screenId: body.context.screenId,
    issue: { number: issue.number, url: issue.html_url, state: 'open', closedAt: null },
    zip: null,
    legacy: false,
    createdAt: now(),
    expiresAt: null,
    extendedUntil: null,
  };
  await reportsRepo.create(report);
  const uploadUrl = body.attachment ? await b2.signPut(reportKey(id), body.attachment.bytes, ZIP_CONTENT_TYPE) : null;
  return { reportId: id, issueUrl: issue.html_url, uploadUrl };
};

export { createReport, ZIP_CONTENT_TYPE };
