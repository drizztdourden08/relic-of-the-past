/* @layer shared-game @kind types */
import type { Recommendation } from '../types';

interface ReconcileOptions {
  inScope?: (recommendation: Recommendation) => boolean;
  now?: number;
}

export type { ReconcileOptions };
