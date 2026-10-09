/* @layer electron-main @kind types */
import type { ReportZip } from '@shared/sanctuary';

interface BuiltAttachment {
  pendingId: string;
  zip: ReportZip;
}

export type { BuiltAttachment };
