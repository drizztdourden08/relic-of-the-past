/* @layer renderer-components @kind logic */
import type { GameSettings } from '@shared/types/settings';
import { DIALOG_BOX_KEYS } from './settings-effects.constants';

const touchesDialogStore = (patch: Partial<GameSettings>): boolean => DIALOG_BOX_KEYS.some((k) => k in patch);

export { touchesDialogStore };
