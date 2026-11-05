/* @layer bridge-wasm @kind types */
import type { RandomizerSession } from '@drizztdourden08/brock-randomizer/session';
import type { PlanCounts } from './physical-plan.type';

interface LocalSession extends RandomizerSession {
  readonly kind: 'local';
  readonly stats: PlanCounts | null;
}

export type { LocalSession };
