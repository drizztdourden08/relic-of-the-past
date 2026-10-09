/* @layer electron-main @kind logic */
import { rm } from 'fs/promises';
import type { BugReportPayload } from '@drizztdourden08/brock-core/types';
import type { MainContext } from '@drizztdourden08/brock-electron/main';
import type { SanctuaryReportSnapshot } from '@shared/ipc';
import { LIMITS } from '@shared/sanctuary';
import { messageOf } from '../submit-report';
import type { PackagedAttachment } from './bug-report.type';
import { TOO_LARGE_ERROR } from './bug-report.constants';
import { buildReportZip } from './build-report-zip';
import { reportProfileId } from './report-profile-id';

const packageAttachment = async (ctx: MainContext, payload: BugReportPayload, snapshot: SanctuaryReportSnapshot | null): Promise<PackagedAttachment> => {
  const profileId = await reportProfileId(ctx, snapshot);
  if (!profileId) return { built: null, error: null };
  try {
    const built = await buildReportZip(ctx, payload, profileId, snapshot?.liveState ?? null);
    if (built.zip.bytes <= LIMITS.reportBytes) return { built, error: null };
    await rm(built.path, { force: true });
    return { built: null, error: TOO_LARGE_ERROR };
  } catch (err) {
    return { built: null, error: messageOf(err, 'Could not package the debug report.') };
  }
};

export { packageAttachment };
