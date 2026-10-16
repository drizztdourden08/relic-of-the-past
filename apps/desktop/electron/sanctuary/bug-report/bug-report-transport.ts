/* @layer electron-main @kind logic */
import type { MainBugReportTransport } from '@drizztdourden08/brock-electron/main';
import { submitReportSchema } from '@rotp/hub-contracts';
import { readToken } from '../../hub/token-store';
import { fileReport, messageOf } from '../submit-report';
import { BAD_CONTACT_ERROR, FILE_FAILED_ERROR, SIGNED_OUT_ERROR } from './bug-report.constants';
import { attachmentHold } from './held-attachment';
import { packageAttachment } from './package-attachment';
import { receiptWithAttachment } from './receipt-with-attachment';
import { reportRequest } from './report-request';
import { reportSnapshotOf } from './report-snapshot-of';

const sanctuaryBugReportTransport: MainBugReportTransport = async (payload, ctx) => {
  if (!(await readToken())) return { success: false, error: SIGNED_OUT_ERROR };
  if (!submitReportSchema.shape.contactEmail.safeParse(payload.contact ?? null).success) return { success: false, error: BAD_CONTACT_ERROR };
  await attachmentHold.release();
  const snapshot = reportSnapshotOf(payload);
  const { built, error } = await packageAttachment(ctx, { ...payload, extras: undefined }, snapshot);
  try {
    const filed = await fileReport(reportRequest(payload, snapshot, built?.zip ?? null));
    return { success: true, value: await receiptWithAttachment(filed, built, error) };
  } catch (err) {
    return { success: false, error: messageOf(err, FILE_FAILED_ERROR) };
  } finally {
    if (built) await attachmentHold.discardUnlessHeld(built);
  }
};

export { sanctuaryBugReportTransport };
