/* @layer electron-main @kind logic */
import type { BugReportReceipt } from '@drizztdourden08/brock-core/types';
import type { SubmitReportResult } from '@rotp/hub-contracts';
import type { BuiltReportZip } from './bug-report.type';
import { attachmentHold } from './held-attachment';
import { receiptOf } from './receipt-of';
import { RETRY_GONE_ERROR } from './retry-upload.constants';
import { uploadAttachment } from './upload-attachment';

const retryUpload = (filed: SubmitReportResult, built: BuiltReportZip): NonNullable<BugReportReceipt['retry']> => async () => {
  if (!attachmentHold.isHeld(built)) return { success: false, error: RETRY_GONE_ERROR };
  const error = await uploadAttachment(filed, built);
  if (error) return { success: false, error };
  await attachmentHold.release();
  return { success: true, value: receiptOf(filed, null) };
};

export { retryUpload };
