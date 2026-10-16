/* @layer electron-main @kind logic */
import { app } from 'electron';
import { randomUUID } from 'crypto';
import { stat } from 'fs/promises';
import { join } from 'path';
import type { BugReportPayload } from '@drizztdourden08/brock-core/types';
import { collectDebugFiles, writeDebugZip } from '@drizztdourden08/brock-electron/main';
import type { MainContext } from '@drizztdourden08/brock-electron/main';
import type { BuiltReportZip, ReportEntries } from './bug-report.type';
import { ZIP_PREFIX } from './bug-report.constants';
import { collectReportEntries } from './collect-report-entries';

const NO_PROFILE_ENTRIES: ReportEntries = { entries: [], saves: [], sessionKeys: [] };

const buildReportZip = async (ctx: MainContext, payload: BugReportPayload, profileId: string | null, liveState: ArrayBuffer | null): Promise<BuiltReportZip> => {
  const debugDir = ctx.paths.data('debug');
  const [{ entries, saves, sessionKeys }, logs] = await Promise.all([
    profileId ? collectReportEntries(ctx.files, profileId, liveState) : NO_PROFILE_ENTRIES,
    collectDebugFiles(debugDir),
  ]);
  const path = await writeDebugZip(join(app.getPath('temp'), `${ZIP_PREFIX}${randomUUID()}.zip`), debugDir, payload, entries);
  const { size } = await stat(path);
  return {
    path,
    zip: { bytes: size, contents: { saves: saves.length, captureSessions: sessionKeys.length, logs: logs.length } },
    profileId,
    sessionKeys,
  };
};

export { buildReportZip };
