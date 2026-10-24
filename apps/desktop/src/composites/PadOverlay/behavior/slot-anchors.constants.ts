/* @layer renderer-components @kind constants */
import type { ControllerSilhouetteAnchorId, ControllerSlotId } from '@drizztdourden08/tessera/composites';
import type { Point } from '../PadOverlay.type';

const SLOT_ANCHOR_ID: Readonly<Record<ControllerSlotId, ControllerSilhouetteAnchorId>> = {
  'face.north': 'face', 'face.east': 'face', 'face.south': 'face', 'face.west': 'face',
  'dpad.up': 'dpad', 'dpad.down': 'dpad', 'dpad.left': 'dpad', 'dpad.right': 'dpad',
  'shoulder.left': 'shoulder.left', 'shoulder.right': 'shoulder.right',
  'trigger.left': 'trigger.left', 'trigger.right': 'trigger.right',
  'stick.left': 'stick.left', 'stick.right': 'stick.right',
  'stick.left.click': 'stick.left', 'stick.right.click': 'stick.right',
  'meta.view': 'meta.view', 'meta.menu': 'meta.menu', 'meta.guide': 'meta.guide', 'meta.capture': 'meta.capture',
};

const FACE_BEARINGS: Readonly<Partial<Record<ControllerSlotId, Point>>> = {
  'face.north': { x: 0, y: -1 },
  'face.east': { x: 1, y: 0 },
  'face.south': { x: 0, y: 1 },
  'face.west': { x: -1, y: 0 },
};

const FACE_BUTTON_RATIO = 0.36;

const UNSIZED_RADIUS: Readonly<Partial<Record<ControllerSilhouetteAnchorId, number>>> = {
  'shoulder.left': 8, 'shoulder.right': 8, 'trigger.left': 6, 'trigger.right': 6,
};

const CENTRE_BAND = 24;

const PATH_NUMBER = /-?\d*\.?\d+/g;

export { CENTRE_BAND, FACE_BEARINGS, FACE_BUTTON_RATIO, PATH_NUMBER, SLOT_ANCHOR_ID, UNSIZED_RADIUS };
