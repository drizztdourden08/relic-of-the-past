/* @layer renderer-lib @kind data */
import type { ControllerSlotId } from '@drizztdourden08/tessera/composites';
import type { FamilyLayout, LayoutFamily } from './controller-families.type';

const XBOX_LAYOUT: FamilyLayout = {
  variant: 'offset',
  labels: {
    'face.south': 'A', 'face.east': 'B', 'face.west': 'X', 'face.north': 'Y',
    'shoulder.left': 'LB', 'shoulder.right': 'RB', 'trigger.left': 'LT', 'trigger.right': 'RT',
    'stick.left': 'Left stick', 'stick.right': 'Right stick', 'stick.left.click': 'LS', 'stick.right.click': 'RS',
    'meta.view': 'View', 'meta.menu': 'Menu', 'meta.guide': 'Xbox', 'meta.capture': 'Share',
  },
  glyphs: {},
};

const PLAYSTATION_LAYOUT: FamilyLayout = {
  variant: 'symmetric',
  labels: {
    'face.south': 'Cross', 'face.east': 'Circle', 'face.west': 'Square', 'face.north': 'Triangle',
    'shoulder.left': 'L1', 'shoulder.right': 'R1', 'trigger.left': 'L2', 'trigger.right': 'R2',
    'stick.left': 'Left stick', 'stick.right': 'Right stick', 'stick.left.click': 'L3', 'stick.right.click': 'R3',
    'meta.view': 'Share', 'meta.menu': 'Options', 'meta.guide': 'PS', 'meta.capture': 'Mute',
  },
  glyphs: {
    'face.south': 'ps-cross', 'face.east': 'ps-circle', 'face.west': 'ps-square', 'face.north': 'ps-triangle',
  },
};

const NINTENDO_LAYOUT: FamilyLayout = {
  variant: 'nintendo',
  labels: {
    'face.south': 'B', 'face.east': 'A', 'face.west': 'Y', 'face.north': 'X',
    'shoulder.left': 'L', 'shoulder.right': 'R', 'trigger.left': 'ZL', 'trigger.right': 'ZR',
    'stick.left': 'Left stick', 'stick.right': 'Right stick', 'stick.left.click': 'LS', 'stick.right.click': 'RS',
    'meta.view': 'Minus', 'meta.menu': 'Plus', 'meta.guide': 'Home', 'meta.capture': 'Capture',
  },
  glyphs: {},
};

const GENERIC_LAYOUT: FamilyLayout = {
  variant: 'offset',
  labels: {
    'face.south': 'S', 'face.east': 'E', 'face.west': 'W', 'face.north': 'N',
    'shoulder.left': 'LB', 'shoulder.right': 'RB', 'trigger.left': 'LT', 'trigger.right': 'RT',
    'stick.left': 'Left stick', 'stick.right': 'Right stick', 'stick.left.click': 'LS', 'stick.right.click': 'RS',
    'meta.view': 'Back', 'meta.menu': 'Start', 'meta.guide': 'Guide', 'meta.capture': 'Extra 1',
  },
  glyphs: {},
};

const SNES_LAYOUT: FamilyLayout = {
  variant: 'pad',
  labels: {
    'face.south': 'B', 'face.east': 'A', 'face.west': 'Y', 'face.north': 'X',
    'shoulder.left': 'L', 'shoulder.right': 'R',
    'meta.view': 'Select', 'meta.menu': 'Start',
  },
  glyphs: {},
};

const FAMILY_LAYOUTS: Record<LayoutFamily, FamilyLayout> = {
  xbox: XBOX_LAYOUT,
  playstation: PLAYSTATION_LAYOUT,
  nintendo: NINTENDO_LAYOUT,
  generic: GENERIC_LAYOUT,
  snes: SNES_LAYOUT,
};

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

export { ANALOG_POSITIONS, FAMILY_LAYOUTS, SLOT_POSITIONS };
