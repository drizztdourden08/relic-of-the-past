/* @layer renderer-hud @kind constants */
const OUTLINE_DIRECTIONS = 8;

const OUTLINE_MAX_WIDTH = 2;

const BORDER_SIDES = ['top', 'right', 'bottom', 'left'] as const;

const BORDER_SIDE_CAPS = { top: 'Top', right: 'Right', bottom: 'Bottom', left: 'Left' } as const;

export { BORDER_SIDE_CAPS, BORDER_SIDES, OUTLINE_DIRECTIONS, OUTLINE_MAX_WIDTH };
