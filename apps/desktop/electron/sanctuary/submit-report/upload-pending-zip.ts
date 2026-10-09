/* @layer electron-main @kind logic */
import { SANCTUARY_ROUTES } from '@shared/sanctuary';
import type { SanctuaryUploadResult } from '@shared/ipc';
import { markSessionsSent } from '../../diagnostics/debug-report/capture-manifest';
import { getPendingReport, dropPendingReport } from '../../diagnostics/debug-report/pending-reports';
import { callApi } from '../../hub/client';
import { SANCTUARY_API } from '../../hub/endpoints';
import { readToken } from '../../hub/token-store';
import { messageOf } from './message-of';
import { ZIP_CONTENT_TYPE } from './submit-report.constants';
import { uploadUrls } from './upload-urls';

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
    await callApi(SANCTUARY_API, { route: SANCTUARY_ROUTES.reportsComplete, params: { id: reportId }, body: {}, token: await readToken() });
    dropPendingReport(reportId);
    uploadUrls.delete(reportId);
    await markSessionsSent(pending.profileId, pending.sessionKeys, Date.now());
    return { uploaded: true };
  } catch (err) {
    return { uploaded: false, error: messageOf(err, 'Could not upload the debug report.') };
  }
};

export { uploadPendingZip };
