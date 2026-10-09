/* @layer renderer-widgets @kind types */
import type { useNavigation } from '../useNavigation';

type PlayerStatePanelProps = Pick<ReturnType<typeof useNavigation>, 'playerDebug' | 'isIndoors' | 'playerX' | 'playerY'>;

export type { PlayerStatePanelProps };
