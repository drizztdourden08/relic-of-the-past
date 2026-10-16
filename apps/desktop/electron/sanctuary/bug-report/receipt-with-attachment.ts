/* @layer electron-main @kind logic */
import type { BugReportReceipt } from '@drizztdourden08/brock-core/types';
import type { SubmitReportResult } from '@rotp/hub-contracts';
import type { BuiltReportZip } from './bug-report.type';
import { attachmentHold } from './held-attachment';
import { receiptOf } from './receipt-of';
import { retryUpload } from './retry-upload';
import { uploadAttachment } from './upload-attachment';

const receiptWithAttachment = async (filed: SubmitReportResult, built: BuiltReportZip | null, packageError: string | null): Promise<BugReportReceipt> => {
  const attachError = built ? await uploadAttachment(filed, built) : packageError;
  if (!built || !attachError || !filed.uploadUrl) return receiptOf(filed, attachError);
  await attachmentHold.hold(built);
  return receiptOf(filed, attachError, retryUpload(filed, built));
};

export { receiptWithAttachment };
