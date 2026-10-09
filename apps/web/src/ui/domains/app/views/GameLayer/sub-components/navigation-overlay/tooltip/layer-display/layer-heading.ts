/* @layer renderer-components @kind logic */
import { ABOVE_HEADING, GROUND_HEADING } from './layer-display.constants';

const layerHeading = (layer: 0 | 1): string => (layer === 0 ? ABOVE_HEADING : GROUND_HEADING);

export { layerHeading };
