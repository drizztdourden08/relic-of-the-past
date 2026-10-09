/* @layer electron-main @kind logic */
import { SANCTUARY_ROUTES } from '@shared/sanctuary';
import type { SubmitReportRequest, SubmitReportResult } from '@shared/sanctuary';
import type { SanctuarySubmitInput, SanctuarySubmitResult } from '@shared/ipc';
import { getPendingReport, storePendingReport, dropPendingReport } from '../../diagnostics/debug-report/pending-reports';
import { callApi } from '../../hub/client';
import { SANCTUARY_API } from '../../hub/endpoints';
import { readToken } from '../../hub/token-store';
import { reportPageUrl } from '../report-page';
import { buildReportAttachment } from '../report-attachment';
import { messageOf } from './message-of';
import { uploadPendingZip } from './upload-pending-zip';
import { uploadUrls } from './upload-urls';

const submitReport = async (input: SanctuarySubmitInput): Promise<SanctuarySubmitResult> => {
  const { request, profileId, saves, sessionKeys } = input;
  let attachError: string | undefined;
  let attachment: Awaited<ReturnType<typeof buildReportAttachment>> = null;
  if (profileId) {
    try {
      attachment = await buildReportAttachment({ profileId, saves, sessionKeys });
    } catch (err) {
      attachError = messageOf(err, 'Could not package the debug report.');
    }
  }

  const body: SubmitReportRequest = { ...request, attachment: attachment?.zip ?? null };
  let filed: SubmitReportResult;
  try {
    filed = await callApi<SubmitReportResult>(SANCTUARY_API, { route: SANCTUARY_ROUTES.reportsCreate, body, token: await readToken() });
  } catch (err) {
    if (attachment) dropPendingReport(attachment.pendingId);
    return { error: messageOf(err, 'Could not file the report.') };
  }

  const base = { reportId: filed.reportId, issueUrl: filed.issueUrl, sanctuaryUrl: reportPageUrl(filed.reportId) };
  if (!attachment) return { ...base, attached: false, uploaded: false, error: attachError };

  const pending = getPendingReport(attachment.pendingId);
  dropPendingReport(attachment.pendingId);
  if (!pending || !filed.uploadUrl) return { ...base, attached: true, uploaded: false, error: 'The upload could not start.' };
  storePendingReport(filed.reportId, pending.zip, pending.profileId, pending.sessionKeys);
  uploadUrls.set(filed.reportId, filed.uploadUrl);
  const upload = await uploadPendingZip(filed.reportId);
  return { ...base, attached: true, uploaded: upload.uploaded, error: upload.error };
};

export { submitReport };
