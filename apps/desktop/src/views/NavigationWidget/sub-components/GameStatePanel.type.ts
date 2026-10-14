/* @layer renderer-widgets @kind types */
import type { useNavigation } from '../behavior/useNavigation';

type GameStatePanelProps = Pick<ReturnType<typeof useNavigation>, 'isIndoors' | 'palaceIndex' | 'roomIndex' | 'dungeonMapPos' | 'roomLayoutInfo' | 'whichEntrance' | 'roomStartLayer' | 'overworldScreenIndex' | 'isDarkWorld' | 'progressInfo' | 'displayedVariant' | 'dynamicBlockerCount'>;

type IndoorBasicRowsProps = Pick<GameStatePanelProps, 'palaceIndex' | 'roomIndex' | 'dungeonMapPos'>;

type IndoorLayoutRowsProps = Pick<GameStatePanelProps, 'roomLayoutInfo' | 'dungeonMapPos'>;

type IndoorEntranceRowsProps = Pick<GameStatePanelProps, 'whichEntrance' | 'palaceIndex' | 'roomStartLayer'>;

type OutdoorRowsProps = Pick<GameStatePanelProps, 'overworldScreenIndex' | 'isDarkWorld'>;

type ProgressRowsProps = Pick<GameStatePanelProps, 'progressInfo' | 'displayedVariant' | 'dynamicBlockerCount'>;

export type {
  GameStatePanelProps, IndoorBasicRowsProps, IndoorEntranceRowsProps, IndoorLayoutRowsProps, OutdoorRowsProps, ProgressRowsProps,
};
