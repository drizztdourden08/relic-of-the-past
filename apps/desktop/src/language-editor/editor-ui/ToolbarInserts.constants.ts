/* @layer renderer-components @kind constants */
import { iconForCodeName } from './icon-for-token';
import { PAUSE_CODE, SPEED_CODE } from './popovers';

const VARIABLE = 'variable';
const PAUSE = 'pause';
const SPEED = 'speed';
const GLYPH = 'glyph';

const PAUSE_ICON = iconForCodeName(PAUSE_CODE);
const SPEED_ICON = iconForCodeName(SPEED_CODE);

export { VARIABLE, PAUSE, SPEED, GLYPH, PAUSE_ICON, SPEED_ICON };
