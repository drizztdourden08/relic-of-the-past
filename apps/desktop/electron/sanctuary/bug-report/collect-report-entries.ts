/* @layer electron-main @kind logic */
import type { FileStore } from '@drizztdourden08/brock-core';
import type { ReportEntries } from './bug-report.type';
import { collectProfileFiles } from './collect-profile-files';
import { collectReportCaptures } from './collect-report-captures';
import { collectReportSaves } from './collect-report-saves';

const collectReportEntries = async (
  files: FileStore, profileId: string, liveState: ArrayBuffer | null, captureSessions: string[],
): Promise<ReportEntries> => {
  const [profileFiles, saved, captures] = await Promise.all([
    collectProfileFiles(files, profileId),
    collectReportSaves(files, profileId, liveState),
    collectReportCaptures(profileId, captureSessions),
  ]);
  const manifest = { createdAt: Date.now(), profileId, saves: saved.saves, captureSessions: captures.sessionKeys };
  return {
    entries: [{ name: 'manifest.json', data: JSON.stringify(manifest, null, 2) }, ...profileFiles, ...saved.entries, ...captures.entries],
    saves: saved.saves,
    sessionKeys: captures.sessionKeys,
  };
};

export { collectReportEntries };
