/* @layer renderer-app @kind logic */
import { useProfilesStore } from '@drizztdourden08/brock-react';
import type { ReportContext } from '@rotp/hub-contracts';
import type { SanctuaryReportSnapshot } from '@app/ipc';
import { captureStateBuffer } from '@app/game/state-buffers';
import { debugLoggingOn } from './debug-logging-on';

const reportSnapshotOf = (context: ReportContext): SanctuaryReportSnapshot => {
  const attachDebugFiles = debugLoggingOn();
  return {
    context,
    profileId: useProfilesStore.getState().active?.id ?? null,
    liveState: attachDebugFiles ? captureStateBuffer() : null,
    attachDebugFiles,
  };
};

export { reportSnapshotOf };
