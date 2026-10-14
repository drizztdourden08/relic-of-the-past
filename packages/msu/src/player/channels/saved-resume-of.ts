/* @layer renderer-lib @kind logic */
import type { ChannelResume } from './channel.type';

const savedResumeOf = (
  resumeEnabled: (() => boolean) | undefined, saved: ReadonlyMap<number, ChannelResume>, id: number,
): ChannelResume | null => (resumeEnabled?.() ? saved.get(id) ?? null : null);

export { savedResumeOf };
