/* @layer shared-types @kind types */
/**
 * The Sanctuary invoke channels: the bug report submission and its upload retry. Split out
 * of `InvokeContract` (which extends this) for the line cap; the signatures still have their
 * one source of truth here. Signing in is the shared account's (hub-contract.ts).
 */
import type { SubmitReportRequest } from '@shared/sanctuary';
import type { DebugReportSaveEntry } from '@shared/types/debug-report';

/**
 * What the renderer hands over to file a report. The attachment sizes are filled in by the
 * main process once it has built the zip, so the request carries everything but that.
 */
type SanctuarySubmitInput = {
  request: Omit<SubmitReportRequest, 'attachment'>;
  /** The active profile when a debug report may be attached; null files the report plain. */
  profileId: string | null;
  saves: DebugReportSaveEntry[];
  /** Exactly the capture sessions the picker had checked. */
  sessionKeys: string[];
};

/**
 * A filed report. `uploaded` is false when nothing was attached or the zip upload failed; the
 * latter carries `error` and can be retried with `sanctuary:retryUpload` against the same
 * report id. A report that could not be filed at all answers with `error` alone.
 */
type SanctuarySubmitResult =
  | { reportId: string; issueUrl: string; sanctuaryUrl: string; attached: boolean; uploaded: boolean; error?: string }
  | { error: string };

type SanctuaryUploadResult = { uploaded: boolean; error?: string };

interface SanctuaryInvokeContract {
  'sanctuary:submitReport': (input: SanctuarySubmitInput) => Promise<SanctuarySubmitResult>;
  'sanctuary:retryUpload': (input: { reportId: string }) => Promise<SanctuaryUploadResult>;
}

export type { SanctuaryInvokeContract, SanctuarySubmitInput, SanctuarySubmitResult, SanctuaryUploadResult };
