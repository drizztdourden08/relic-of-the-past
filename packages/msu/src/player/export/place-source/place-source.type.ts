/* @layer renderer-lib @kind types */
import type { FadeEnvelope } from '../fade-envelope';

interface ScheduleOptions {
  ctx: BaseAudioContext;
  windowSeconds: number;
  seed: number;
  singlePass?: boolean;
}

type PlaySource = (buffer: AudioBuffer, when: number, offsetSeconds?: number,
  fade?: FadeEnvelope) => void;

export type { ScheduleOptions, PlaySource };
