/* @layer root-config @kind logic */
import { LIMITS } from '@rotp/hub-contracts';
import type { Report, SubmitReportRequest, SubmitReportResult } from '@rotp/hub-contracts';
import { badRequest, tooMany } from '@rotp/hub-server';
import type { Caller } from '@rotp/hub-server';
import { usersRepo } from '@rotp/hub-server';
import { reportsRepo } from '../db/reports-repo';
import { rateLimitRepo } from '@rotp/hub-server';
import { now } from '@rotp/hub-server';
import { github } from '../github/issues';
import { filesBucket } from '../storage/files-bucket';
import { reportKey } from '../storage/keys';
import { reporterLine } from './reporter-line';
import { newReportId } from './report-id';
import { ANONYMOUS_WINDOW_MS, BODY_BY_KIND, LABEL_BY_KIND, ZIP_CONTENT_TYPE } from './create-report.constants';

const createReport = async (caller: Caller | null, ip: string, body: SubmitReportRequest): Promise<SubmitReportResult> => {
  if (!caller) {
    if (!(await rateLimitRepo.checkRateLimit(ip, LIMITS.anonymousReportsPer10Min, ANONYMOUS_WINDOW_MS))) throw tooMany('Too many reports. Try again later.');
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
  const uploadUrl = body.attachment ? await filesBucket.signPut(reportKey(id), body.attachment.bytes, ZIP_CONTENT_TYPE) : null;
  return { reportId: id, issueUrl: issue.html_url, uploadUrl };
};

export { createReport };
