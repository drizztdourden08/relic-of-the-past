/* @layer shared-types @kind types */
import type { OptimizeProgress } from '@rotp/msu';
import type { LanSighting } from '@drizztdourden08/brock-randomizer/archipelago';

interface EventContract {
  'msu:optimize:progress': (progress: OptimizeProgress) => void;
  'lan:sighting': (sighting: LanSighting) => void;
}

export type { EventContract };
