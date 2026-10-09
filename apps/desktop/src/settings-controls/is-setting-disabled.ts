/* @layer renderer-app @kind logic */
import type { GameSettings } from '@shared/types/settings';
import { isAudioSettingDisabled } from './audio/is-audio-disabled';
import { isGameplaySettingDisabled } from './gameplay/is-gameplay-disabled';
import { isGraphicsSettingDisabled } from './graphics/is-graphics-disabled';
import { isHapticsSettingDisabled } from './haptics/is-haptics-disabled';
import { isHudSettingDisabled } from './hud/is-hud-disabled';

const isSettingDisabled = (key: string, settings: GameSettings): boolean =>
  isGraphicsSettingDisabled(key, settings)
  || isGameplaySettingDisabled(key, settings)
  || isAudioSettingDisabled(key, settings)
  || isHudSettingDisabled(key, settings)
  || (key.startsWith('haptics.') && isHapticsSettingDisabled(key, settings));

export { isSettingDisabled };
