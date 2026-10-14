/* @layer renderer-lib @kind logic */
import type { FadePlan, VoiceOptions } from '../voice.type';

const createFadePlan = (startedAt: number, options: VoiceOptions): FadePlan => {
  const { fadeInSeconds = 0, fadeOutAfterSeconds, fadeOutSeconds = 0 } = options;
  return {
    startedAt,
    fadeInSeconds,
    fadeOutSeconds,
    fadeOutStart: fadeOutAfterSeconds === undefined ? null : startedAt + Math.max(fadeInSeconds, fadeOutAfterSeconds),
  };
};

export { createFadePlan };
