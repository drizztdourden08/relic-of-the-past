/* @layer electron-main @kind logic */
import { getAppState } from '@drizztdourden08/brock-core/storage';
import type { MainContext } from '@drizztdourden08/brock-electron/main';
import type { SanctuaryReportSnapshot } from '@app/ipc';

const reportProfileId = async (ctx: MainContext, snapshot: SanctuaryReportSnapshot | null): Promise<string | null> => {
  if (!snapshot?.attachDebugFiles) return null;
  return snapshot.profileId ?? ctx.instance.profile ?? (await getAppState(ctx.files)).lastProfileId;
};

export { reportProfileId };
