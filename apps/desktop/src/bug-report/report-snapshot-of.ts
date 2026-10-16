/* @layer renderer-app @kind logic */
import { useProfilesStore } from '@drizztdourden08/brock-react';
import type { ReportContext } from '@rotp/hub-contracts';
import type { SanctuaryReportSnapshot } from '@app/ipc';
import { captureStateBuffer } from '@app/game/state-buffers';
import { liveSettingsNow } from '@app/game/live-settings';

const reportSnapshotOf = (context: ReportContext): SanctuaryReportSnapshot => {
  const attachDebugFiles = liveSettingsNow()?.allowDebugLogging === true;
  return {
    context,
    profileId: useProfilesStore.getState().active?.id ?? null,
    liveState: attachDebugFiles ? captureStateBuffer() : null,
    attachDebugFiles,
  };
};

export { reportSnapshotOf };
