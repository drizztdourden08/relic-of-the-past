/* @layer renderer-lib @kind data */
import type { ControllerSlotId } from '@drizztdourden08/tessera/composites';

const SLOT_POSITIONS: Partial<Record<ControllerSlotId, readonly string[]>> = {
  'face.south': ['SOUTH'], 'face.east': ['EAST'], 'face.west': ['WEST'], 'face.north': ['NORTH'],
  'dpad.up': ['DPAD_UP'], 'dpad.down': ['DPAD_DOWN'], 'dpad.left': ['DPAD_LEFT'], 'dpad.right': ['DPAD_RIGHT'],
  'shoulder.left': ['LEFT_SHOULDER'], 'shoulder.right': ['RIGHT_SHOULDER'],
  'trigger.left': ['LEFT_TRIGGER'], 'trigger.right': ['RIGHT_TRIGGER'],
  'stick.left': ['LEFT_X', 'LEFT_Y'], 'stick.right': ['RIGHT_X', 'RIGHT_Y'],
  'stick.left.click': ['LEFT_STICK'], 'stick.right.click': ['RIGHT_STICK'],
  'meta.view': ['BACK'], 'meta.menu': ['START'], 'meta.guide': ['GUIDE'], 'meta.capture': ['MISC1'],
};

const ANALOG_POSITIONS: readonly string[] = ['LEFT_X', 'RIGHT_X', 'LEFT_TRIGGER', 'RIGHT_TRIGGER'];

export { ANALOG_POSITIONS, SLOT_POSITIONS };
