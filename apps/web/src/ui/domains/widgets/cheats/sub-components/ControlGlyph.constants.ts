/* @layer renderer-widgets @kind constants */
const MOUSE_OUTLINE = [
  'M8 1.5C5.5 1.5 4 3.3 4 5.5v5c0 2.2 1.5 4 4 4s4-1.8 4-4v-5c0-2.2-1.5-4-4-4Z',
  'M8 1.5v5',
  'M4 6.5h8',
];

const MOUSE_FILL: Record<'mouse-left' | 'mouse-right' | 'wheel', string[]> = {
  'mouse-left': ['M7.3 2.2C5.4 2.5 4.7 4 4.7 5.5v0.3h2.6V2.2Z'],
  'mouse-right': ['M8.7 2.2c1.9 0.3 2.6 1.8 2.6 3.3v0.3H8.7V2.2Z'],
  wheel: ['M7.2 3h1.6v2.8H7.2Z'],
};

const ICON_SIZE = 16;

export { ICON_SIZE, MOUSE_FILL, MOUSE_OUTLINE };
