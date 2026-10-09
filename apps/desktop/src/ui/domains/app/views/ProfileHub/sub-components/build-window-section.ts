/* @layer renderer-components @kind logic */
import type { GameSettings } from '@shared/types/settings';
import type { Section, SettingItem } from '../../../compounds/SettingsLayout';
import { PIXEL_PERFECT_ITEM } from './SettingsView.constants';

const buildWindowSection = (s: GameSettings): Section => {
  const items: SettingItem[] = [
    { key: 'windowMode', label: 'Window Mode', description: 'Window display mode', keywords: 'borderless windowed default' },
    { key: 'startFullscreen', label: 'Start in Fullscreen', description: 'Automatically enter fullscreen when the game starts', keywords: 'fullscreen launch start' },
    { key: 'viewportConstraint', label: 'Viewport', description: 'Controls how the game canvas relates to the window', keywords: 'ratio lock constrain aspect black bars stretch fill fit viewport' },
  ];

  if (s.viewportConstraint === 'none') items.push(PIXEL_PERFECT_ITEM);

  return { id: 'window', title: 'Window', items };
};

export { buildWindowSection };
