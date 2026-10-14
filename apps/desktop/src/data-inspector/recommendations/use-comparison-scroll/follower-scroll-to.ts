/* @layer renderer-app @kind logic */
import type { ScrollPosition } from '@drizztdourden08/tessera/primitives';
import type { Lead, PaneSide } from '../recommendations.type';

const followerScrollTo = (lead: Lead | null, side: PaneSide): Partial<ScrollPosition> | undefined =>
  (lead && lead.side !== side ? lead.position : undefined);

export { followerScrollTo };
