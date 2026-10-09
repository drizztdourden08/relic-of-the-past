/* @layer renderer-components @kind constants */
import { iconForCodeName } from './icon-for-token';
import { PAUSE_CODE, SPEED_CODE } from './popovers';

const VARIABLE = 'variable';
const PAUSE = 'pause';
const SPEED = 'speed';
const GLYPH = 'glyph';

const VARIABLE_LABEL = 'Insert a variable';
const PAUSE_LABEL = 'Insert a pause';
const SPEED_LABEL = 'Insert a text speed';
const GLYPH_LABEL = 'Insert a picture character';

const PAUSE_ICON = iconForCodeName(PAUSE_CODE);
const SPEED_ICON = iconForCodeName(SPEED_CODE);

export {
  VARIABLE, PAUSE, SPEED, GLYPH, VARIABLE_LABEL, PAUSE_LABEL, SPEED_LABEL, GLYPH_LABEL, PAUSE_ICON, SPEED_ICON,
};
