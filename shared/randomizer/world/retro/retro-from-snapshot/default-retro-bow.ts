/* @layer shared-game @kind logic */
import { DEFAULT_RETRO_BOW } from '../retro-bow.data';
import type { RetroBowSetting } from '../retro.type';

const defaultRetroBow = (): RetroBowSetting => ({ ...DEFAULT_RETRO_BOW });

export { defaultRetroBow };
