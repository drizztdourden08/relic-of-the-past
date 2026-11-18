/* @layer electron-main @kind logic */
import { rm } from 'fs/promises';
import type { BugReportPayload } from '@drizztdourden08/brock-core/types';
import type { MainContext } from '@drizztdourden08/brock-electron/main';
import type { SanctuaryReportExtras } from '@app/ipc';
import { LIMITS } from '@rotp/hub-contracts';
import { msg } from '@drizztdourden08/brock-core/i18n';
import { mainText } from '../../lib/main-text';
import { messageOf } from '../submit-report';
import type { PackagedAttachment } from './bug-report.type';
import { TOO_LARGE_ERROR } from './bug-report.constants';
import { buildReportZip } from './build-report-zip';
import { reportProfileId } from './report-profile-id';

const packageAttachment = async (ctx: MainContext, payload: BugReportPayload, snapshot: SanctuaryReportExtras | null): Promise<PackagedAttachment> => {
  const profileId = await reportProfileId(ctx, snapshot);
  const hasUserFiles = (payload.attachments?.length ?? 0) > 0;
  if (!profileId && !hasUserFiles) return { built: null, error: null };
  try {
    const built = await buildReportZip(ctx, payload, profileId, snapshot);
    if (built.zip.bytes <= LIMITS.reportBytes) return { built, error: null };
    await rm(built.path, { force: true });
    return { built: null, error: mainText(TOO_LARGE_ERROR) };
  } catch (err) {
    return { built: null, error: messageOf(err, mainText(msg('main:sanctuary.report.packageFailed'))) };
  }
};

export { packageAttachment };
