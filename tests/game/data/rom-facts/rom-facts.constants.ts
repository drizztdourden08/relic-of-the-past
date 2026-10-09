/* @layer tests @kind constants */
import { resolve } from 'path';

const CORE = resolve(__dirname, '..', '..', '..', '..', 'core', 'game-hooks', 'events');
const SPECIAL_SCREENS = [0x80, 0x81];
const BOSS_TAGS = [37, 56];
const CHEST_ROW_EXCEPTIONS = ['check-270'];
const SCRIPTED_ENTRANCES = [0];
const MOUTHS_NO_SCREEN_CARRIES = [118, 121];
const MOUTH_AREA_EXCEPTIONS: readonly string[] = [];
const KEY_GATED_CROSSINGS = 59;

export {
  BOSS_TAGS, CHEST_ROW_EXCEPTIONS, CORE, KEY_GATED_CROSSINGS, MOUTH_AREA_EXCEPTIONS, MOUTHS_NO_SCREEN_CARRIES,
  SCRIPTED_ENTRANCES, SPECIAL_SCREENS,
};
