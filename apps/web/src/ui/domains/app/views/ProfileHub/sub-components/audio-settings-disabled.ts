/* @layer renderer-components @kind logic */
import type { GameSettings } from '@shared/types/settings';
import { GROUP_VOLUME_KEYS, PACK_DEPENDENT_KEYS } from './audio-settings-controls.constants';

const isAudioSettingDisabled = (key: string, settings: GameSettings): boolean => {
  if (PACK_DEPENDENT_KEYS.includes(key)) {
    if (settings.vanillaSafe) return true;
    return settings.msuConfigMode === 'manual' && settings.enableMSU === 'false';
  }
  if (GROUP_VOLUME_KEYS.includes(key)) return !settings.perGroupVolume;
  return false;
};

export { isAudioSettingDisabled };
