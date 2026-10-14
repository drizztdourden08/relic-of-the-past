/* @layer renderer-widgets @kind types */
import type { useNavigation } from '../behavior/useNavigation';
import type { PlayerDebugState } from '../behavior/hooks.type';

type PlayerStatePanelProps = Pick<ReturnType<typeof useNavigation>, 'playerDebug' | 'isIndoors' | 'playerX' | 'playerY'>;

interface PlayerRowProps {
  playerDebug: PlayerDebugState;
}

interface PlayerPositionRowsProps {
  playerDebug: PlayerDebugState;
  isIndoors: boolean;
  playerX: number;
  playerY: number;
}

export type { PlayerPositionRowsProps, PlayerRowProps, PlayerStatePanelProps };
