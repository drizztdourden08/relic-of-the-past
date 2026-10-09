/* @layer electron-main @kind logic */
import { collectCaptureSessions } from '../../diagnostics/debug-report/collect-capture-sessions';
import { listCaptureSessions } from '../../diagnostics/debug-report/list-sessions';
import type { CollectedCaptures } from './bug-report.type';
import { CAPTURE_BUDGET_BYTES } from './bug-report.constants';

const unsentWithinBudget = async (profileId: string): Promise<string[]> => {
  const unsent = (await listCaptureSessions(profileId))
    .filter((session) => session.sentAt === null && session.sizeBytes > 0)
    .sort((a, b) => b.startedAt - a.startedAt);
  const keys: string[] = [];
  let total = 0;
  for (const session of unsent) {
    if (total + session.sizeBytes > CAPTURE_BUDGET_BYTES) continue;
    total += session.sizeBytes;
    keys.push(session.sessionKey);
  }
  return keys;
};

const collectReportCaptures = async (profileId: string): Promise<CollectedCaptures> => {
  const sessions = await collectCaptureSessions(profileId, await unsentWithinBudget(profileId));
  return {
    entries: sessions.flatMap((session) =>
      session.files.map((file) => ({ name: `capture/${session.sessionKey}/${file.name}`, data: file.contents }))),
    sessionKeys: sessions.map((session) => session.sessionKey),
  };
};

export { collectReportCaptures };
