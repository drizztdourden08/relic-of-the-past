/* @layer renderer-components @kind types */
import type { NetworkPlayer } from '@app/lib/game/randomizer-client';
import type { PanelPlacement } from '../Randomizer.type';

interface RunPlayersProps {
  placement: PanelPlacement;
  players: readonly NetworkPlayer[] | null;
}

export type { RunPlayersProps };
