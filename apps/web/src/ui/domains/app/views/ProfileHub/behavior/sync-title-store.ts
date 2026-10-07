/* @layer renderer-components @kind logic */
/**
 * Mirrors the title screen settings into the overlay's store. Vanilla Safe stands the overlay down
 * the way it does the HUD: it masks the bit the native title is hidden through, so the overlay reads
 * 'original' while the saved preference stays put.
 */
import type { GameSettings } from '@shared/types/settings';
import { useTitleSettingsStore } from '../../../../../../stores/title-settings-store';

const TITLE_KEYS = ['titleScreen', 'titleMotion', 'titleFollowsProgress', 'titleSword', 'dimFlashes', 'vanillaSafe'] as const;

const syncTitleStore = (s: GameSettings): void => {
  const vanilla = s.vanillaSafe === true;
  useTitleSettingsStore.getState().setTitleSettings({
    screen: vanilla ? 'original' : s.titleScreen,
    motion: s.titleMotion,
    followsProgress: s.titleFollowsProgress,
    sword: s.titleSword,
    dimFlashes: s.dimFlashes,
  });
};

const touchesTitleStore = (patch: Partial<GameSettings>): boolean => TITLE_KEYS.some((k) => k in patch);

export { syncTitleStore, touchesTitleStore };
