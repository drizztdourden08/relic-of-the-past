/* @layer renderer-app @kind logic */
import type { GameSettings } from '@rotp/features';
import { isAudioSettingDisabled } from './audio/is-audio-disabled';
import { isDisplaySettingDisabled } from './display/is-display-disabled';
import { isGameplaySettingDisabled } from './gameplay/is-gameplay-disabled';
import { isGraphicsSettingDisabled } from './graphics/is-graphics-disabled';
import { isHapticsSettingDisabled } from './haptics/is-haptics-disabled';
import { isHudSettingDisabled } from './hud/is-hud-disabled';

const isSettingDisabled = (key: string, settings: GameSettings): boolean =>
  isDisplaySettingDisabled(key, settings)
  || isGraphicsSettingDisabled(key, settings)
  || isGameplaySettingDisabled(key, settings)
  || isAudioSettingDisabled(key, settings)
  || isHudSettingDisabled(key, settings)
  || (key.startsWith('haptics.') && isHapticsSettingDisabled(key, settings));

export { isSettingDisabled };
