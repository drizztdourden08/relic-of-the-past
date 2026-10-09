/* @layer renderer-components @kind logic */
import type { GameSettings } from '@rotp/features';
import { isTitleDisabled } from './is-title-disabled';
import { isDialogDisabled } from './is-dialog-disabled';

const isHudSettingDisabled = (key: string, settings: GameSettings): boolean =>
  isTitleDisabled(key, settings) || isDialogDisabled(key, settings);

export { isHudSettingDisabled };
