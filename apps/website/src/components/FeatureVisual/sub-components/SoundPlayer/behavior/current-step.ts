/* @layer website-site @kind logic */
import type { VideoStep } from '../../../../../features';
import { NO_STEP } from '../SoundPlayer.constants';

const currentStepIndex = (steps: readonly VideoStep[], time: number): number =>
  steps.reduce((found, step, index) => (step.at <= time ? index : found), NO_STEP);

export { currentStepIndex };
