/* @layer electron-main @kind logic */
import { rm } from 'fs/promises';
import type { MainBugReportTransport } from '@drizztdourden08/brock-electron/main';
import { readToken } from '../../hub/token-store';
import { takeReportSnapshot } from '../report-snapshot';
import { fileReport, messageOf } from '../submit-report';
import { FILE_FAILED_ERROR, SIGNED_OUT_ERROR } from './bug-report.constants';
import { packageAttachment } from './package-attachment';
import { receiptOf } from './receipt-of';
import { reportRequest } from './report-request';
import { uploadAttachment } from './upload-attachment';

const sanctuaryBugReportTransport: MainBugReportTransport = async (payload, ctx) => {
  if (!(await readToken())) return { success: false, error: SIGNED_OUT_ERROR };
  const snapshot = takeReportSnapshot();
  const { built, error } = await packageAttachment(ctx, payload, snapshot);
  try {
    const filed = await fileReport(reportRequest(payload, snapshot, built?.zip ?? null));
    const attachError = built ? await uploadAttachment(filed, built) : error;
    return { success: true, value: receiptOf(filed.reportId, attachError) };
  } catch (err) {
    return { success: false, error: messageOf(err, FILE_FAILED_ERROR) };
  } finally {
    if (built) await rm(built.path, { force: true });
  }
};

export { sanctuaryBugReportTransport };
