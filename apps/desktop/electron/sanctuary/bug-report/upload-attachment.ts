/* @layer electron-main @kind logic */
import { readFile } from 'fs/promises';
import type { SubmitReportResult } from '@shared/sanctuary';
import { markSessionsSent } from '../../diagnostics/debug-report/capture-manifest';
import { messageOf, uploadReportZip } from '../submit-report';
import type { BuiltReportZip } from './bug-report.type';
import { NO_UPLOAD_URL_ERROR } from './bug-report.constants';

const uploadAttachment = async (filed: SubmitReportResult, built: BuiltReportZip): Promise<string | null> => {
  if (!filed.uploadUrl) return NO_UPLOAD_URL_ERROR;
  try {
    await uploadReportZip(filed.reportId, filed.uploadUrl, await readFile(built.path));
    await markSessionsSent(built.profileId, built.sessionKeys, Date.now());
    return null;
  } catch (err) {
    return messageOf(err, 'Could not upload the debug report.');
  }
};

export { uploadAttachment };
