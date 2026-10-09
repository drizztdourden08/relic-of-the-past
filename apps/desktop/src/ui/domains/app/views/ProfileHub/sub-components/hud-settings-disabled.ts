/* @layer renderer-components @kind logic */
import type { GameSettings } from '@shared/types/settings';
import { isTitleDisabled } from './hud-title-disabled';
import { isDialogDisabled } from './hud-dialog-disabled';

const isHudSettingDisabled = (key: string, settings: GameSettings): boolean =>
  isTitleDisabled(key, settings) || isDialogDisabled(key, settings);

export { isHudSettingDisabled };
