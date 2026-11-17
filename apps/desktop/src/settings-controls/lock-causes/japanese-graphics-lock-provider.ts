/* @layer renderer-app @kind logic */
import { LOCK_CAUSE_ORDER } from '@drizztdourden08/brock-react';
import type { LockCauseProvider } from '@drizztdourden08/brock-react';
import type { GameSettings } from '@rotp/features';
import { useJapaneseGraphicsStore } from '@app/stores/japanese-graphics-store';
import { JAPANESE_GRAPHICS_KEYS } from './japanese-graphics-keys.constants';

const japaneseGraphicsLockProvider: LockCauseProvider<GameSettings> = {
  id: 'japaneseGraphics',
  order: LOCK_CAUSE_ORDER.developer,
  causeOf: (key) =>
    JAPANESE_GRAPHICS_KEYS.includes(key) && !useJapaneseGraphicsStore.getState().available ? 'japaneseGraphics' : null,
};

export { japaneseGraphicsLockProvider };
