/* @layer shared-types @kind types */
import type { SubmitReportRequest } from '@shared/sanctuary';
import type { DebugReportSaveEntry } from '@shared/types/debug-report';

type SanctuarySubmitInput = {
  request: Omit<SubmitReportRequest, 'attachment'>;
  profileId: string | null;
  saves: DebugReportSaveEntry[];
  sessionKeys: string[];
};

type SanctuarySubmitResult =
  | { reportId: string; issueUrl: string; sanctuaryUrl: string; attached: boolean; uploaded: boolean; error?: string }
  | { error: string };

type SanctuaryUploadResult = { uploaded: boolean; error?: string };

interface SanctuaryInvokeContract {
  'sanctuary:submitReport': (input: SanctuarySubmitInput) => Promise<SanctuarySubmitResult>;
  'sanctuary:retryUpload': (input: { reportId: string }) => Promise<SanctuaryUploadResult>;
}

export type { SanctuaryInvokeContract, SanctuarySubmitInput, SanctuarySubmitResult, SanctuaryUploadResult };
