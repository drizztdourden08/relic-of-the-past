/* @layer electron-main @kind logic */
import { readFile } from 'fs/promises';
import { msg } from '@drizztdourden08/brock-core/i18n';
import type { SubmitReportResult } from '@rotp/hub-contracts';
import { mainText } from '../../lib/main-text';
import { markSessionsSent } from '../../diagnostics/debug-report/capture-manifest';
import { messageOf, uploadReportZip } from '../submit-report';
import type { BuiltReportZip } from './bug-report.type';
import { NO_UPLOAD_URL_ERROR } from './bug-report.constants';

const uploadAttachment = async (filed: SubmitReportResult, built: BuiltReportZip): Promise<string | null> => {
  if (!filed.uploadUrl) return mainText(NO_UPLOAD_URL_ERROR);
  try {
    await uploadReportZip(filed.reportId, filed.uploadUrl, await readFile(built.path));
    if (built.profileId) await markSessionsSent(built.profileId, built.sessionKeys, Date.now());
    return null;
  } catch (err) {
    return messageOf(err, mainText(msg('main:sanctuary.report.uploadFailed')));
  }
};

export { uploadAttachment };
