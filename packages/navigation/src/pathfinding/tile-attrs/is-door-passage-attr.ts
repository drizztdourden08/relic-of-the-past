/* @layer shared-game @kind logic */
import { LAYER_TOGGLE_SHUTTER_ATTRS, PLAIN_DOOR_PASSAGE_ATTRS } from './tile-attrs.constants';

const isDoorPassageAttr = (attr: number): boolean =>
  (attr >= PLAIN_DOOR_PASSAGE_ATTRS.first && attr <= PLAIN_DOOR_PASSAGE_ATTRS.last)
  || (attr >= LAYER_TOGGLE_SHUTTER_ATTRS.first && attr <= LAYER_TOGGLE_SHUTTER_ATTRS.last);

export { isDoorPassageAttr };
