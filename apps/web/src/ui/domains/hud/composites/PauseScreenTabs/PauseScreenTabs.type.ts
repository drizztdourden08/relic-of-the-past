/* @layer renderer-hud @kind types */
import type { PauseScreen } from '@shared/game/logic/pause';

interface ScreenTab {
  id: PauseScreen;
  label: string;
}

interface PauseScreenTabsProps {
  tabs: readonly ScreenTab[];
  active: PauseScreen;
  scale: number;
  spritesBase: string;
  onSelect: (screen: PauseScreen) => void;
}

export type { PauseScreenTabsProps, ScreenTab };
