/* @layer renderer-app @kind logic */
import type { GameSettings } from '@shared/types/settings';
import { DEVICE_KEYS, GROUP_VOLUME_KEYS, PACK_DEPENDENT_KEYS } from './audio-controls.constants';

const isAudioSettingDisabled = (key: string, settings: GameSettings): boolean => {
  if (PACK_DEPENDENT_KEYS.includes(key)) {
    if (settings.vanillaSafe) return true;
    return settings.msuConfigMode === 'manual' && settings.enableMSU === 'false';
  }
  if (GROUP_VOLUME_KEYS.includes(key)) return !settings.perGroupVolume;
  if (DEVICE_KEYS.includes(key)) return settings.msuConfigMode === 'auto' || settings.vanillaSafe;
  if (key === 'msuConfigMode' || key === 'enableMSU') return settings.vanillaSafe;
  return false;
};

export { isAudioSettingDisabled };
