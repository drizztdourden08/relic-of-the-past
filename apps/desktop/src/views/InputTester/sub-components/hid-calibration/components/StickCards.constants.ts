/* @layer renderer-components @kind constants */
const STICK_SIDES = ['left', 'right'] as const;

const STICK_AXES = {
  left: { label: 'LEFT', xId: 'leftX', yId: 'leftY' },
  right: { label: 'RIGHT', xId: 'rightX', yId: 'rightY' },
} as const;

export { STICK_SIDES, STICK_AXES };
