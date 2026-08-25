/* @layer renderer-lib @kind logic */
/**
 * The renderer's side of the optional media probe.
 *
 * ffprobe is a native process, so it can only run in the main process; this is the one
 * bridge to it. On a host without the IPC surface (mobile, browser) it resolves null,
 * which callers already treat as "nothing knowable" — so no caller needs a host check.
 */
import type { AudioProbe } from '@shared/types/audio-probe';

const probeAudioFile: AudioProbe = (dataPath) =>
  window.api?.probeAudioFile?.(dataPath) ?? Promise.resolve(null);

export { probeAudioFile };
