/* @layer electron-main @kind logic */
import { rm } from 'fs/promises';
import type { MainBugReportTransport } from '@drizztdourden08/brock-electron/main';
import { submitReportSchema } from '@rotp/hub-contracts';
import { readToken } from '../../hub/token-store';
import { fileReport, messageOf } from '../submit-report';
import { BAD_CONTACT_ERROR, FILE_FAILED_ERROR, SIGNED_OUT_ERROR } from './bug-report.constants';
import { packageAttachment } from './package-attachment';
import { receiptOf } from './receipt-of';
import { reportRequest } from './report-request';
import { reportSnapshotOf } from './report-snapshot-of';
import { uploadAttachment } from './upload-attachment';

const sanctuaryBugReportTransport: MainBugReportTransport = async (payload, ctx) => {
  if (!(await readToken())) return { success: false, error: SIGNED_OUT_ERROR };
  if (!submitReportSchema.shape.contactEmail.safeParse(payload.contact ?? null).success) return { success: false, error: BAD_CONTACT_ERROR };
  const snapshot = reportSnapshotOf(payload);
  const { built, error } = await packageAttachment(ctx, { ...payload, extras: undefined }, snapshot);
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
