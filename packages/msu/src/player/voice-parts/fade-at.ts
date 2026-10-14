/* @layer renderer-lib @kind logic */
import type { FadePlan, VoiceFade } from '../voice.type';

const fadeAt = (plan: FadePlan, now: number): VoiceFade | null => {
  const { startedAt, fadeInSeconds, fadeOutStart, fadeOutSeconds } = plan;
  if (fadeInSeconds > 0 && now < startedAt + fadeInSeconds) {
    return { kind: 'in', remainingSeconds: startedAt + fadeInSeconds - now, totalSeconds: fadeInSeconds };
  }
  if (fadeOutStart !== null && fadeOutSeconds > 0 && now >= fadeOutStart && now < fadeOutStart + fadeOutSeconds) {
    return { kind: 'out', remainingSeconds: fadeOutStart + fadeOutSeconds - now, totalSeconds: fadeOutSeconds };
  }
  return null;
};

export { fadeAt };
