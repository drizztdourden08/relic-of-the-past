/* @layer renderer-components @kind types */
import type { NetworkPlayer } from '@app/lib/game/randomizer-client';

interface PlayersTableProps {
  players: readonly NetworkPlayer[];
  compact?: boolean;
}

export type { PlayersTableProps };
