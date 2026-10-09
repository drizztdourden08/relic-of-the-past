/* @layer renderer-components @kind logic */
import type { GameSettings } from '@rotp/features';
import { TITLE_KEYS } from './settings-effects.constants';

const touchesTitleStore = (patch: Partial<GameSettings>): boolean => TITLE_KEYS.some((k) => k in patch);

export { touchesTitleStore };
