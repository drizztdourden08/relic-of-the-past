/* @layer renderer-lib @kind logic */
import type { LayerActivity, LiveActivityParams } from './scheduler.type';
import { soundingVoices } from './sounding-voices';

const liveActivity = (params: LiveActivityParams): LayerActivity => {
  const { live, fileNames, lastFileIndex, nextEventInSeconds, waitSeconds } = params;
  const newest = live.at(-1);
  return {
    fileName: fileNames[newest?.fileIndex ?? lastFileIndex ?? 0] ?? null,
    nextEventInSeconds,
    waitSeconds,
    positionSeconds: newest?.voice.offsetSeconds() ?? null,
    durationSeconds: newest?.voice.durationSeconds ?? null,
    sounding: live.length > 0,
    voiceCount: live.length,
    voices: soundingVoices(live, fileNames),
  };
};

export { liveActivity };
