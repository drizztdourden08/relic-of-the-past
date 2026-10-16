/* @layer shared-types @kind types */
import type { OptimizeProgress } from '@rotp/msu';

interface EventContract {
  'msu:optimize:progress': (progress: OptimizeProgress) => void;
}

export type { EventContract };
