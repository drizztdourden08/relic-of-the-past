/* @layer electron-main @kind logic */
import type { BugReportPayload } from '@drizztdourden08/brock-core/types';
import type { SanctuaryReportExtras } from '@app/ipc';
import { submitReportSchema } from '@rotp/hub-contracts';

const liveStateOf = (value: unknown): ArrayBuffer | null => {
  if (value instanceof ArrayBuffer) return value;
  if (ArrayBuffer.isView(value)) return new Uint8Array(value.buffer, value.byteOffset, value.byteLength).slice().buffer;
  return null;
};

const sessionKeysOf = (value: unknown): string[] =>
  (Array.isArray(value) ? value.filter((key): key is string => typeof key === 'string') : []);

const reportSnapshotOf = ({ extras }: BugReportPayload): SanctuaryReportExtras | null => {
  const context = submitReportSchema.shape.context.safeParse(extras?.context);
  if (!extras || !context.success) return null;
  const { profileId, liveState, attachDebugFiles, captureSessions } = extras;
  return {
    context: context.data,
    profileId: typeof profileId === 'string' ? profileId : null,
    liveState: liveStateOf(liveState),
    attachDebugFiles: attachDebugFiles === true,
    captureSessions: sessionKeysOf(captureSessions),
  };
};

export { reportSnapshotOf };
