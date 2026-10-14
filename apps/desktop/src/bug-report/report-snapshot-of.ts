/* @layer renderer-app @kind logic */
import { useProfilesStore } from '@drizztdourden08/brock-react';
import type { ReportContext } from '@rotp/hub-contracts';
import type { SanctuaryReportSnapshot } from '@app/ipc';
import { captureStateBuffer } from '@app/game/state-buffers';

const reportSnapshotOf = (context: ReportContext): SanctuaryReportSnapshot => ({
  context,
  profileId: useProfilesStore.getState().active?.id ?? null,
  liveState: captureStateBuffer(),
});

export { reportSnapshotOf };
