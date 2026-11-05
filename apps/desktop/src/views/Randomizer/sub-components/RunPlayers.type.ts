/* @layer renderer-components @kind types */
import type { NetworkPlayer } from '@drizztdourden08/brock-randomizer/archipelago';
import type { PanelPlacement } from '../Randomizer.type';

interface RunPlayersProps {
  placement: PanelPlacement;
  players: readonly NetworkPlayer[] | null;
}

export type { RunPlayersProps };
