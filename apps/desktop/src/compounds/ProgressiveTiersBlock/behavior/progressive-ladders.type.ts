/* @layer renderer-components @kind types */
import type { ProgressiveFamilyId } from '@rotp/randomizer';
import type { LadderStepperModel } from '@app/composites/LadderStepper';

interface ProgressiveLadder extends LadderStepperModel {
  id: ProgressiveFamilyId;
}

export type { ProgressiveLadder };
