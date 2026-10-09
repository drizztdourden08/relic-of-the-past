/* @layer renderer-components @kind types */
import type { NetworkPlayer } from '@app/lib/game/randomizer-client';

interface PlayerRowProps {
  player: NetworkPlayer;
  compact?: boolean;
}

export type { PlayerRowProps };
