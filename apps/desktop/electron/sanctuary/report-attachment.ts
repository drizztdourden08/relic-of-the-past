/* @layer electron-main @kind logic */
/**
 * The zip a report carries, built with the debug-report machinery, plus the counts the
 * Sanctuary shows in its Reports table. Nothing to attach (no saves, no checked recordings)
 * is not a failure: the report files plain, as it did before the picker existed.
 */
import { randomUUID } from 'crypto';
import type { ReportZip } from '@shared/sanctuary';
import type { DebugReportPackageInput } from '@shared/types/debug-report';
import { collectDebugReportFiles } from '../diagnostics/debug-report/collect-files';
import { collectCaptureSessions } from '../diagnostics/debug-report/collect-capture-sessions';
import { buildDebugReportZip } from '../diagnostics/debug-report/build-zip';
import { storePendingReport } from '../diagnostics/debug-report/pending-reports';

/** The zip is held in the pending-report cache under `pendingId` until it is uploaded. */
interface BuiltAttachment {
  pendingId: string;
  zip: ReportZip;
}

const buildReportAttachment = async (input: DebugReportPackageInput): Promise<BuiltAttachment | null> => {
  if (input.saves.length === 0 && input.sessionKeys.length === 0) return null;
  const [files, captureSessions] = await Promise.all([
    collectDebugReportFiles(input.profileId),
    collectCaptureSessions(input.profileId, input.sessionKeys),
  ]);
  const bytes = await buildDebugReportZip(input, files, captureSessions);
  const pendingId = randomUUID().slice(0, 12);
  storePendingReport(pendingId, bytes, input.profileId, input.sessionKeys);
  return {
    pendingId,
    zip: {
      bytes: bytes.byteLength,
      contents: { saves: input.saves.length, captureSessions: captureSessions.length, logs: files.logFiles.length },
    },
  };
};

export { buildReportAttachment };
export type { BuiltAttachment };
