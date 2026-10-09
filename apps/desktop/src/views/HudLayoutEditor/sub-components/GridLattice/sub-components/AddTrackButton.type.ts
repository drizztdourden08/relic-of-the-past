/* @layer renderer-components @kind types */
import type { TrackAxis } from '../GridLattice.type';

interface AddTrackButtonProps {
  axis: TrackAxis;
  at: number;
  onAdd: () => void;
}

export type { AddTrackButtonProps };
