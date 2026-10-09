/* @layer renderer-lib @kind logic */
import type { FadeEnvelope } from './fade-envelope.type';

const hasFade = (fade: FadeEnvelope): boolean => {
  const { fadeInSeconds = 0, fadeOutAfterSeconds, fadeOutSeconds = 0 } = fade;
  return fadeInSeconds > 0 || (fadeOutAfterSeconds !== undefined && fadeOutSeconds > 0);
};

export { hasFade };
