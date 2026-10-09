/* @layer renderer-widgets @kind types */
import type { useNavigation } from '../useNavigation';

type GameStatePanelProps = Pick<ReturnType<typeof useNavigation>, 'isIndoors' | 'palaceIndex' | 'roomIndex' | 'dungeonMapPos' | 'roomLayoutInfo' | 'whichEntrance' | 'roomStartLayer' | 'overworldScreenIndex' | 'isDarkWorld' | 'progressInfo' | 'displayedVariant' | 'dynamicBlockerCount'>;

export type { GameStatePanelProps };
