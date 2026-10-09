/* @layer renderer-components @kind constants */
import { optionsOf } from './options-of';

const GRID_ITEMS = optionsOf(['start', 'center', 'end', 'stretch']);
const FLEX_JUSTIFY = optionsOf(['start', 'center', 'end', 'between', 'around', 'evenly']);
const FLEX_ALIGN = optionsOf(['start', 'center', 'end']);

export { FLEX_ALIGN, FLEX_JUSTIFY, GRID_ITEMS };
