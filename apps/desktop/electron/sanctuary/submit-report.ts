/* @layer electron-main @kind logic */
/**
 * Filing a report: build the zip, POST /reports (which creates the record and the GitHub
 * issue in one call and answers with a presigned PUT), send the zip straight to the bucket,
 * then POST /reports/:id/complete. A failed upload leaves the record with no zip and the zip
 * in the pending cache under the report id, so a retry sends the same bytes again without
 * rebuilding. Sessions are marked sent only once the upload went through.
 */
import type { SubmitReportRequest, SubmitReportResult } from '@shared/sanctuary';
import type { SanctuarySubmitInput, SanctuarySubmitResult, SanctuaryUploadResult } from '@shared/ipc';
import { markSessionsSent } from '../diagnostics/debug-report/capture-manifest';
import { getPendingReport, storePendingReport, dropPendingReport } from '../diagnostics/debug-report/pending-reports';
import { callApi } from './client';
import { reportPageUrl } from './endpoint';
import { buildReportAttachment } from './report-attachment';
import { readToken } from './token-store';

const ZIP_CONTENT_TYPE = 'application/zip';

/** Presigned PUT per report id, kept for a retry; the pending cache holds the bytes. */
const uploadUrls = new Map<string, string>();

const messageOf = (err: unknown, fallback: string): string =>
  (err instanceof Error && err.message.length > 0 ? err.message : fallback);

const uploadPendingZip = async (reportId: string): Promise<SanctuaryUploadResult> => {
  const pending = getPendingReport(reportId);
  const uploadUrl = uploadUrls.get(reportId);
  if (!pending || !uploadUrl) return { uploaded: false, error: 'Report expired. File it again.' };
  try {
    const put = await fetch(uploadUrl, {
      method: 'PUT',
      headers: { 'Content-Type': ZIP_CONTENT_TYPE, 'Content-Length': String(pending.zip.byteLength) },
      body: new Uint8Array(pending.zip),
    });
    if (!put.ok) return { uploaded: false, error: `upload failed (${put.status})` };
    await callApi({ route: 'reportsComplete', params: { id: reportId }, body: {}, token: await readToken() });
    dropPendingReport(reportId);
    uploadUrls.delete(reportId);
    await markSessionsSent(pending.profileId, pending.sessionKeys, Date.now());
    return { uploaded: true };
  } catch (err) {
    return { uploaded: false, error: messageOf(err, 'Could not upload the debug report.') };
  }
};

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
    filed = await callApi<SubmitReportResult>({ route: 'reportsCreate', body, token: await readToken() });
  } catch (err) {
    if (attachment) dropPendingReport(attachment.pendingId);
    return { error: messageOf(err, 'Could not file the report.') };
  }

  const base = { reportId: filed.reportId, issueUrl: filed.issueUrl, sanctuaryUrl: reportPageUrl(filed.reportId) };
  if (!attachment) return { ...base, attached: false, uploaded: false, error: attachError };

  // The zip was cached under a local id before the API minted the report id; rekey it so a
  // retry can find it by the id the renderer holds.
  const pending = getPendingReport(attachment.pendingId);
  dropPendingReport(attachment.pendingId);
  if (!pending || !filed.uploadUrl) return { ...base, attached: true, uploaded: false, error: 'The upload could not start.' };
  storePendingReport(filed.reportId, pending.zip, pending.profileId, pending.sessionKeys);
  uploadUrls.set(filed.reportId, filed.uploadUrl);
  const upload = await uploadPendingZip(filed.reportId);
  return { ...base, attached: true, uploaded: upload.uploaded, error: upload.error };
};

export { submitReport, uploadPendingZip };
