/* @layer renderer-lib @kind constants */
import type { JobOptions } from '@drizztdourden08/brock-core/types';
import type { ExtractStepId } from '@app/game/extract-steps';

const STEP_JOB_OPTIONS: Record<ExtractStepId, JobOptions> = {
  assets: { onDuplicate: 'queue', forwardLog: true },
  language: { onDuplicate: 'parallel' },
  'menu-text': { onDuplicate: 'join', visible: false },
  sprites: { onDuplicate: 'join' },
};

export { STEP_JOB_OPTIONS };
