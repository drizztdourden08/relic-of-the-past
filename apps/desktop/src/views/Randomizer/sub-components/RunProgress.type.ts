/* @layer renderer-components @kind types */
import type { NetworkProgress } from '@app/game/randomizer-client';
import type { PanelPlacement } from '../Randomizer.type';

interface RunProgressProps {
  placement: PanelPlacement;
  room: NetworkProgress | null;
}

export type { RunProgressProps };
