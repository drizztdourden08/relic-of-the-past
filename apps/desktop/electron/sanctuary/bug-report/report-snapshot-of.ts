/* @layer electron-main @kind logic */
import type { BugReportPayload } from '@drizztdourden08/brock-core/types';
import type { SanctuaryReportSnapshot } from '@app/ipc';
import { submitReportSchema } from '@rotp/hub-contracts';

const liveStateOf = (value: unknown): ArrayBuffer | null => {
  if (value instanceof ArrayBuffer) return value;
  if (ArrayBuffer.isView(value)) return new Uint8Array(value.buffer, value.byteOffset, value.byteLength).slice().buffer;
  return null;
};

const reportSnapshotOf = ({ extras }: BugReportPayload): SanctuaryReportSnapshot | null => {
  const context = submitReportSchema.shape.context.safeParse(extras?.context);
  if (!extras || !context.success) return null;
  const { profileId, liveState, attachDebugFiles } = extras;
  return {
    context: context.data,
    profileId: typeof profileId === 'string' ? profileId : null,
    liveState: liveStateOf(liveState),
    attachDebugFiles: attachDebugFiles === true,
  };
};

export { reportSnapshotOf };
