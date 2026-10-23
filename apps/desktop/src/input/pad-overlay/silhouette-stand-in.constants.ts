/* @layer renderer-lib @kind data */
import type { SilhouetteAnchor, SilhouetteVariant } from './pad-overlay.type';

const GRIP_PATH =
  'M 70 62 C 70 38 84 24 108 24 L 136 24 C 150 24 158 34 162 48 L 238 48 C 242 34 250 24 264 24 L 292 24 '
  + 'C 316 24 330 38 330 62 C 360 72 380 120 392 190 C 398 238 372 262 346 246 C 326 232 312 200 286 194 '
  + 'L 114 194 C 88 200 74 232 54 246 C 28 262 2 238 8 190 C 20 120 40 72 70 62 Z';

const PILL_PATH =
  'M 120 62 C 120 50 128 42 140 42 L 168 42 C 178 42 184 52 186 62 L 214 62 C 216 52 222 42 232 42 L 260 42 '
  + 'C 272 42 280 50 280 62 A 80 80 0 0 1 280 222 L 120 222 A 80 80 0 0 1 120 62 Z';

const CONTROLLER_SILHOUETTE_PATHS: Readonly<Record<SilhouetteVariant, string>> = {
  offset: GRIP_PATH, symmetric: GRIP_PATH, nintendo: GRIP_PATH, pad: PILL_PATH,
};

const GRIP_TOP_ROWS: readonly SilhouetteAnchor[] = [
  { id: 'trigger.left', kind: 'trigger', x: 110, y: 38, r: 10 },
  { id: 'trigger.right', kind: 'trigger', x: 290, y: 38, r: 10 },
  { id: 'shoulder.left', kind: 'shoulder', x: 112, y: 72, r: 8 },
  { id: 'shoulder.right', kind: 'shoulder', x: 288, y: 72, r: 8 },
];

const GRIP_FACE_ROWS: readonly SilhouetteAnchor[] = [
  { id: 'face.north', kind: 'button', x: 292, y: 88, r: 11 },
  { id: 'face.east', kind: 'button', x: 316, y: 112, r: 11 },
  { id: 'face.south', kind: 'button', x: 292, y: 136, r: 11 },
  { id: 'face.west', kind: 'button', x: 268, y: 112, r: 11 },
];

const GRIP_DPAD_ROWS: readonly SilhouetteAnchor[] = [
  { id: 'dpad.up', kind: 'dpad', x: 150, y: 138, r: 10 },
  { id: 'dpad.down', kind: 'dpad', x: 150, y: 182, r: 10 },
  { id: 'dpad.left', kind: 'dpad', x: 128, y: 160, r: 10 },
  { id: 'dpad.right', kind: 'dpad', x: 172, y: 160, r: 10 },
];

const GRIP_STICK_ROWS: readonly SilhouetteAnchor[] = [
  { id: 'stick.left', kind: 'stick', x: 108, y: 118, r: 22 },
  { id: 'stick.right', kind: 'stick', x: 250, y: 160, r: 22 },
  { id: 'stick.left.click', kind: 'button', x: 108, y: 118, r: 22 },
  { id: 'stick.right.click', kind: 'button', x: 250, y: 160, r: 22 },
];

const CONTROLLER_SILHOUETTE_ANCHORS: Readonly<Record<SilhouetteVariant, readonly SilhouetteAnchor[]>> = {
  offset: [
    ...GRIP_TOP_ROWS, ...GRIP_FACE_ROWS, ...GRIP_DPAD_ROWS, ...GRIP_STICK_ROWS,
    { id: 'meta.view', kind: 'button', x: 172, y: 104, r: 8 },
    { id: 'meta.menu', kind: 'button', x: 228, y: 104, r: 8 },
    { id: 'meta.guide', kind: 'button', x: 200, y: 84, r: 10 },
    { id: 'meta.capture', kind: 'button', x: 200, y: 128, r: 8 },
  ],
  symmetric: [
    ...GRIP_TOP_ROWS,
    { id: 'face.north', kind: 'button', x: 292, y: 94, r: 11 },
    { id: 'face.east', kind: 'button', x: 316, y: 118, r: 11 },
    { id: 'face.south', kind: 'button', x: 292, y: 142, r: 11 },
    { id: 'face.west', kind: 'button', x: 268, y: 118, r: 11 },
    { id: 'dpad.up', kind: 'dpad', x: 108, y: 96, r: 10 },
    { id: 'dpad.down', kind: 'dpad', x: 108, y: 140, r: 10 },
    { id: 'dpad.left', kind: 'dpad', x: 86, y: 118, r: 10 },
    { id: 'dpad.right', kind: 'dpad', x: 130, y: 118, r: 10 },
    { id: 'stick.left', kind: 'stick', x: 158, y: 162, r: 22 },
    { id: 'stick.right', kind: 'stick', x: 242, y: 162, r: 22 },
    { id: 'stick.left.click', kind: 'button', x: 158, y: 162, r: 22 },
    { id: 'stick.right.click', kind: 'button', x: 242, y: 162, r: 22 },
    { id: 'meta.view', kind: 'button', x: 150, y: 92, r: 8 },
    { id: 'meta.menu', kind: 'button', x: 250, y: 92, r: 8 },
    { id: 'meta.guide', kind: 'button', x: 200, y: 162, r: 10 },
    { id: 'meta.capture', kind: 'button', x: 200, y: 112, r: 8 },
  ],
  nintendo: [
    ...GRIP_TOP_ROWS, ...GRIP_FACE_ROWS, ...GRIP_DPAD_ROWS, ...GRIP_STICK_ROWS,
    { id: 'meta.view', kind: 'button', x: 170, y: 96, r: 8 },
    { id: 'meta.menu', kind: 'button', x: 230, y: 96, r: 8 },
    { id: 'meta.guide', kind: 'button', x: 220, y: 126, r: 10 },
    { id: 'meta.capture', kind: 'button', x: 180, y: 126, r: 8 },
  ],
  pad: [
    { id: 'trigger.left', kind: 'trigger', x: 153, y: 53, r: 10 },
    { id: 'trigger.right', kind: 'trigger', x: 247, y: 53, r: 10 },
    { id: 'shoulder.left', kind: 'shoulder', x: 112, y: 86, r: 8 },
    { id: 'shoulder.right', kind: 'shoulder', x: 288, y: 86, r: 8 },
    { id: 'face.north', kind: 'button', x: 300, y: 118, r: 10 },
    { id: 'face.east', kind: 'button', x: 324, y: 142, r: 10 },
    { id: 'face.south', kind: 'button', x: 300, y: 166, r: 10 },
    { id: 'face.west', kind: 'button', x: 276, y: 142, r: 10 },
    { id: 'dpad.up', kind: 'dpad', x: 100, y: 120, r: 9 },
    { id: 'dpad.down', kind: 'dpad', x: 100, y: 164, r: 9 },
    { id: 'dpad.left', kind: 'dpad', x: 78, y: 142, r: 9 },
    { id: 'dpad.right', kind: 'dpad', x: 122, y: 142, r: 9 },
    { id: 'stick.left', kind: 'stick', x: 160, y: 182, r: 20 },
    { id: 'stick.right', kind: 'stick', x: 240, y: 182, r: 20 },
    { id: 'stick.left.click', kind: 'button', x: 160, y: 182, r: 20 },
    { id: 'stick.right.click', kind: 'button', x: 240, y: 182, r: 20 },
    { id: 'meta.view', kind: 'button', x: 178, y: 118, r: 8 },
    { id: 'meta.menu', kind: 'button', x: 222, y: 118, r: 8 },
    { id: 'meta.guide', kind: 'button', x: 200, y: 96, r: 10 },
    { id: 'meta.capture', kind: 'button', x: 200, y: 142, r: 8 },
  ],
};

export { CONTROLLER_SILHOUETTE_ANCHORS, CONTROLLER_SILHOUETTE_PATHS };
