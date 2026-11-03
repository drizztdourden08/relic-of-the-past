/* @layer renderer-lib @kind logic */
import type { FadeEnvelope } from '../export/fade-envelope/fade-envelope.type';

const scheduleEnvelope = (gain: AudioParam, startedAt: number, fade: FadeEnvelope): void => {
  const { fadeInSeconds = 0, fadeOutAfterSeconds, fadeOutSeconds = 0 } = fade;
  if (fadeInSeconds > 0) {
    gain.setValueAtTime(0, startedAt);
    gain.linearRampToValueAtTime(1, startedAt + fadeInSeconds);
  } else {
    gain.setValueAtTime(1, startedAt);
  }
  if (fadeOutAfterSeconds !== undefined && fadeOutSeconds > 0) {
    const outAt = startedAt + Math.max(fadeInSeconds, fadeOutAfterSeconds);
    gain.setValueAtTime(1, outAt);
    gain.linearRampToValueAtTime(0, outAt + fadeOutSeconds);
  }
};

export { scheduleEnvelope };
