/* @layer test @kind test */
import { describe, it, expect } from 'vitest';
import type { UIMode } from '@shared/game/types';
import { isMainHudVisibleForMode } from '../../apps/desktop/src/ui/domains/hud/hud-visibility';

describe('isMainHudVisibleForMode', () => {
  it('shows the main HUD during gameplay, dialogue, and the pause slide', () => {
    const visible: UIMode[] = ['gameplay', 'text', 'paused_menu'];
    for (const mode of visible) expect(isMainHudVisibleForMode(mode)).toBe(true);
  });

  it('hides the main HUD during intro, loading, maps, and other menus', () => {
    const hidden: UIMode[] = [
      'title', 'loading', 'overworld_map', 'dungeon_map',
      'flute_menu', 'save_menu', 'game_over', 'save_and_quit',
    ];
    for (const mode of hidden) expect(isMainHudVisibleForMode(mode)).toBe(false);
  });
});
