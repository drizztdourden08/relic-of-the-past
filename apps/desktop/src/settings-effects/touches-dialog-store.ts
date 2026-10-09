/* @layer renderer-components @kind logic */
import type { GameSettings } from '@rotp/features';
import { DIALOG_BOX_KEYS } from './settings-effects.constants';

const touchesDialogStore = (patch: Partial<GameSettings>): boolean => DIALOG_BOX_KEYS.some((k) => k in patch);

export { touchesDialogStore };
