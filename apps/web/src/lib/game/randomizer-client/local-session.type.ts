/* @layer bridge-wasm @kind types */
import type { PlanCounts } from './physical-plan.type';
import type { RandomizerSession, SessionStatusListener } from './session.type';

interface LocalSession extends RandomizerSession {
  readonly kind: 'local';
  onStatusChange(listener: SessionStatusListener): () => void;
  readonly stats: PlanCounts;
}

export type { LocalSession };
