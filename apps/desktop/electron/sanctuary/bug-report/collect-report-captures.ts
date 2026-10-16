/* @layer electron-main @kind logic */
import { collectCaptureSessions } from '../../diagnostics/debug-report/collect-capture-sessions';
import { isSessionKey } from '../../diagnostics/debug-report/session-key';
import type { CollectedCaptures } from './bug-report.type';

const collectReportCaptures = async (profileId: string, sessionKeys: string[]): Promise<CollectedCaptures> => {
  const sessions = await collectCaptureSessions(profileId, sessionKeys.filter(isSessionKey));
  return {
    entries: sessions.flatMap((session) =>
      session.files.map((file) => ({ name: `capture/${session.sessionKey}/${file.name}`, data: file.contents }))),
    sessionKeys: sessions.map((session) => session.sessionKey),
  };
};

export { collectReportCaptures };
