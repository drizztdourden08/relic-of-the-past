/* @layer renderer-components @kind constants */
const BUTTON_KEYS = [
  'a', 'b', 'x', 'y', 'back', 'guide', 'start', 'leftstick', 'rightstick',
  'leftshoulder', 'rightshoulder', 'dpup', 'dpdown', 'dpleft', 'dpright', 'misc1',
] as const;

const AXIS_KEYS = ['leftx', 'lefty', 'rightx', 'righty', 'lefttrigger', 'righttrigger'] as const;

const DIRECTION_PREFIX = /^[~+-]/;

export { BUTTON_KEYS, AXIS_KEYS, DIRECTION_PREFIX };
