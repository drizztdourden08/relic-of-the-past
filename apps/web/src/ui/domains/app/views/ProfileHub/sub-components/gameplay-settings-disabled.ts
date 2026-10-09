/* @layer renderer-components @kind logic */
import type { GameSettings } from '@shared/types/settings';
import { controlSchemeOf } from '@shared/features/hud-style';

const isGameplaySettingDisabled = (key: string, settings: GameSettings): boolean => {
  if (key === 'saveHoldDuration') return !settings.enhancedSaveSlotShortcut;
  if (key === 'autoSaveIntervalSeconds') return !settings.autoSaveEnabled;
  if (key === 'autoSaveMaxEntries') return !settings.autoSaveEnabled;
  if (key === 'turboSpeed') return !settings.turboEnabled;
  if (key === 'mapOnSelect') return controlSchemeOf(settings) === 'modern';
  return false;
};

export { isGameplaySettingDisabled };
