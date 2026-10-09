/* @layer shared-input @kind constants */
import { BUTTON_INDEX } from '../family';
import type { SdlAxisName } from '../family';

const AXIS_ID_ALIAS: Partial<Record<SdlAxisName, string>> = {
  LEFT_X: 'leftX', LEFT_Y: 'leftY', RIGHT_X: 'rightX', RIGHT_Y: 'rightY',
  LEFT_TRIGGER: 'leftTrigger', RIGHT_TRIGGER: 'rightTrigger',
};

const ALL_BUTTONS = new Array(Object.keys(BUTTON_INDEX).length).fill(true);
const ALL_AXES = new Array(6).fill(true);

export { ALL_AXES, ALL_BUTTONS, AXIS_ID_ALIAS };
