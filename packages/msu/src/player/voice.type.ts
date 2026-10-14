/* @layer renderer-lib @kind types */
interface VoiceOptions {
  loop: boolean;
  offsetSeconds?: number;
  onEnded?: () => void;
  fadeInSeconds?: number;
  fadeOutAfterSeconds?: number;
  fadeOutSeconds?: number;
  loopSecondsOverride?: number;
}

interface VoiceFade {
  kind: 'in' | 'out';
  remainingSeconds: number;
  totalSeconds: number;
}

interface Voice {
  stop: () => void;
  offsetSeconds: () => number;
  durationSeconds: number;
  loopSeconds: number | null;
  fade: () => VoiceFade | null;
}

interface FadePlan {
  startedAt: number;
  fadeInSeconds: number;
  fadeOutSeconds: number;
  fadeOutStart: number | null;
}

interface PlaybackSpan {
  duration: number;
  loopStart: number;
}

export type { FadePlan, PlaybackSpan, Voice, VoiceOptions, VoiceFade };
