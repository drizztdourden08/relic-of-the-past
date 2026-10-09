/* @layer renderer-lib @kind constants */
import type { LayerResume } from '@rotp/game-data';
import type { LayerActivity } from './scheduler.type';

const EMPTY_RESUME: LayerResume = { fileIndex: 0, offsetSeconds: 0, nextEventInSeconds: null };
const IDLE_ACTIVITY: LayerActivity = {
  fileName: null, nextEventInSeconds: null, waitSeconds: null,
  positionSeconds: null, durationSeconds: null, sounding: false, voiceCount: 0, voices: [],
};

export { EMPTY_RESUME, IDLE_ACTIVITY };
