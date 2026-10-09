/* @layer renderer-components @kind logic */
import type { GameSettings } from '@shared/types/settings';
import { useTitleSettingsStore } from '@app/stores/title-settings-store';

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

export { syncTitleStore };
