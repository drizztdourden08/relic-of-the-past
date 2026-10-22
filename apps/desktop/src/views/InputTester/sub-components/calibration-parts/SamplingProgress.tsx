/* @layer renderer-components @kind component */
import { ProgressBar } from '@drizztdourden08/tessera/primitives';
import { PERCENT } from './calibration-parts.constants';
import type { SamplingProgressProps } from './calibration-parts.type';

const SamplingProgress = ({ progress }: SamplingProgressProps) => (
  <ProgressBar value={Math.round(progress * PERCENT)} max={PERCENT} label="Sampling..." showValue />
);

export { SamplingProgress };
