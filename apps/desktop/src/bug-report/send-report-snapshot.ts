/* @layer renderer-app @kind logic */
import { useProfilesStore } from '@drizztdourden08/brock-react';
import type { ReportContext } from '@rotp/hub-contracts';
import { appApi } from '@app/ipc/app-api';
import type { AppApi } from '@app/ipc/app-api.type';
import { captureStateBuffer } from '@app/lib/game/state-buffers';

const sendReportSnapshot = async (context: ReportContext): Promise<void> => {
  const api = appApi() as Partial<AppApi> | undefined;
  if (!api?.setReportSnapshot) return;
  const profileId = useProfilesStore.getState().active?.id ?? null;
  await api.setReportSnapshot({ context, profileId, liveState: captureStateBuffer() });
};

export { sendReportSnapshot };
