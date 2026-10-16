/* @layer shared-types @kind types */
import type { ReportContext, SubmitReportRequest } from '@rotp/hub-contracts';

type SanctuarySubmitInput = {
  request: Omit<SubmitReportRequest, 'attachment'>;
};

type SanctuarySubmitResult =
  | { reportId: string; issueUrl: string; sanctuaryUrl: string }
  | { error: string };

type SanctuaryReportSnapshot = {
  context: ReportContext;
  profileId: string | null;
  liveState: ArrayBuffer | null;
  attachDebugFiles: boolean;
};

type SanctuaryReportExtras = SanctuaryReportSnapshot & { captureSessions: string[] };

interface SanctuaryInvokeContract {
  'sanctuary:submitReport': (input: SanctuarySubmitInput) => Promise<SanctuarySubmitResult>;
}

export type { SanctuaryInvokeContract, SanctuarySubmitInput, SanctuarySubmitResult, SanctuaryReportSnapshot, SanctuaryReportExtras };
